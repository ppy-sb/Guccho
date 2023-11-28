import { zip } from 'lodash-es'
import type { Id } from '..'
import { config } from '../env'
import { assertIsBanchoPyMode, idToString, stringToId, toBanchoPyMode, toUserAvatarSrc, toUserCompact } from '../transforms'
import { BanchoPyPrivilege } from './../enums'
import { getPrismaClient } from './source/prisma'
import { users } from '~/server/singleton/service'
import { Rank } from '~/def'
import { ClanProvider as Base } from '$base/server'
import { ClanRelation } from '~/def/clan'

export class ClanProvider extends Base<Id> {
  static stringToId = stringToId
  static idToString = idToString

  config = config()
  db = getPrismaClient()

  async search(opt: Base.SearchParam): Promise<Base.SearchResult<Id>> {
    const { keyword, page, perPage, mode, ruleset } = opt

    const bMode = toBanchoPyMode(mode, ruleset)
    assertIsBanchoPyMode(bMode)

    const start = page * perPage
    const iNumber = ClanProvider.stringToId(keyword)
    interface ReturnValue {
      ownerId: number
      countUser: bigint
      sumPP: bigint
      sumRankedScore: bigint
      sumTotalScore: bigint
      name: string
      badge: string
      createdAt: Date
      id: number
      userIdList: string
      userNameList: string
    }

    const [count, result] = await this.db.$transaction([
      this.db.clan.count({
        where: {
          OR: [
            {
              name: {
                contains: keyword,
              },
            },
            {
              tag: {
                contains: keyword,
              },
            },
            Number.isNaN(iNumber)
              ? undefined
              : {
                  id: {
                    equals: iNumber,
                  },
                },
          ].filter(TSFilter),
        },
      }),
      this.db.$queryRaw<ReturnValue[]>`
SELECT
  ownerId,
  COUNT(*) AS countUser,
  SUM(pp) AS sumPP,
  SUM(rscore) as sumRankedScore,
  SUM(tscore) as sumTotalScore,
  id,
  name,
  badge,
  createdAt,
  GROUP_CONCAT(REPLACE(userName, ',' ,'&#44;') ORDER BY pp DESC) AS userNameList,
  GROUP_CONCAT(userId ORDER BY pp DESC) AS userIdList
FROM (
  SELECT
    c.owner AS ownerId,
    s.pp,
    s.rscore,
    s.tscore,
    c.id,
    c.name,
    c.tag AS badge,
    c.created_at AS createdAt,
    u.name AS userName,
    u.id AS userId
  FROM clans c
  INNER JOIN users u ON u.clan_id = c.id
  INNER JOIN stats s ON s.id = u.id AND s.mode = ${bMode}
  WHERE (c.name LIKE ${`%${keyword}%`}
    OR c.tag LIKE ${`%${keyword}%`}
    OR (CASE WHEN 1 = ${Number.isNaN(iNumber)} THEN c.id = ${iNumber} ELSE 0 END))
    AND (u.priv & ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified} = ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified})
) AS _
GROUP BY id, name, badge, createdAt
ORDER BY sumPP DESC
LIMIT ${start}, ${perPage};
    `,
    ])

    return [
      count,
      await Promise.all(result.map(async (a) => {
        const idList = a.userIdList.split(',').slice(0, 20).map(v => Number.parseInt(v))
        const nameList = a.userNameList.split(',').slice(0, 20)
        const owner = await users.getCompactById({ id: a.ownerId }).catch(() => users.getCompactById({ id: 999 }))
        return {
          ...pick(a, ['id', 'name', 'badge', 'createdAt']),
          users: zip(idList, nameList).filter((cur): cur is [Id, string] => !!(cur[0] && cur[1])).slice(0, 5).map(([id, name]) => ({
            name,
            avatarSrc: toUserAvatarSrc({ id }, this.config),
          })),
          avatarSrc: owner.avatarSrc,
          sum: {
            [Rank.PPv1]: 0,
            [Rank.PPv2]: Number(a.sumPP),
            [Rank.RankedScore]: BigInt(a.sumRankedScore),
            [Rank.TotalScore]: BigInt(a.sumTotalScore),
          },
          countUser: Number(a.countUser),
          owner,
        }
      })),
    ]
  }

  async detail(opt: Base.DetailParam<Id>): Promise<Base.DetailResult<Id>> {
    const [result, countUser] = await this.db.$transaction([
      this.db.clan.findFirstOrThrow({
        where: {
          id: opt.id,
        },
        include: {
          owner: {
            select: {
              name: true,
              id: true,
              safeName: true,
              priv: true,
              country: true,
            },
          },
        },
      }),
      this.db.user.count({ where: { clanId: opt.id } }),
    ])
    const uc = toUserCompact(result.owner, this.config)

    return {
      name: result.name,
      id: result.id,
      badge: result.tag,
      createdAt: result.createdAt,
      owner: toUserCompact(result.owner, this.config),
      avatarSrc: uc.avatarSrc,
      countUser,
      // joinedUsers: result.joinedUsers.map(user => toUserCompact(user, this.config)),
    }
  }

  async checkRelation(opt: Base.ChangeRelationRequestParam<Id>) {
    const { userId, clanId } = opt
    const result = await this.db.user.findFirstOrThrow({
      select: {
        clan: true,
      },
      where: {
        id: userId,
      },
    })

    switch (true) {
      case result.clan === null:
        // @ts-expect-error you are dumb
      // eslint-disable-next-line no-fallthrough
      case result.clan.id === 0: return ClanRelation.Free

      // @ts-expect-error you are dumb
      case result.clan.id === clanId: return ClanRelation.Joined
      default: return ClanRelation.JoinedOtherClan
    }
  }

  async joinRequest(opt: Base.ChangeRelationRequestParam<Id>) {
    const { userId, clanId } = opt
    // due to no index constraint user clan may point to null
    const result = await this.db.user.findFirstOrThrow({
      where: {
        id: userId,
      },
      include: {
        clan: true,
      },
    })

    switch (true) {
      case result.clan === null:
      case result.clanId === 0: {
        const result = await this.db.user.update({
          where: {
            id: userId,
          },
          data: {
            clanId,
          },
        })

        return result.clanId === clanId
          ? ClanRelation.Joined
          : ClanRelation.Left
      }
      default: return ClanRelation.JoinedOtherClan
    }
  }

  async leaveRequest(opt: Base.ChangeRelationRequestParam<Id>) {
    const { userId, clanId } = opt
    const result = await this.db.user.update({
      where: {
        id: userId,
        clanId,
      },

      data: {
        clanId: 0,
      },
    }).catch(noop)
    return result
      ? result.clanId === clanId
        ? ClanRelation.Joined
        : ClanRelation.Left
      : ClanRelation.JoinedOtherClan
  }

  async users(opt: Base.UsersParam<Id>): Promise<Base.UsersResult<Id>> {
    const start = opt.page * opt.perPage
    const users = await this.db.user.findMany({
      where: {
        clan: {
          id: opt.id,
        },
      },
      skip: start,
      take: opt.perPage,
    })

    return users.map(v => toUserCompact(v, this.config))
  }
}
