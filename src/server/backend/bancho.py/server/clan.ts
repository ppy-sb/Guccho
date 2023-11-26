import { zip } from 'lodash-es'
import { and, eq, like, or, sql } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import type { Id } from '..'
import { config } from '../env'
import { assertIsBanchoPyMode, idToString, stringToId, toBanchoPyMode, toUserAvatarSrc, toUserCompact } from '../transforms'
import { BanchoPyPrivilege } from './../enums'
import getDrizzle from './source/drizzle'
import { users } from '~/server/singleton/service'
import { Rank } from '~/def'
import { ClanProvider as Base } from '$base/server'
import { ClanRelation } from '~/def/clan'

export class ClanProvider extends Base<Id> {
  static stringToId = stringToId
  static idToString = idToString

  static #userPriv = sql`${schema.users.priv} & ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified} = ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified}`

  config = config()

  #drizzleLoader = getDrizzle(schema)
  get drizzle() {
    return this.#drizzleLoader() ?? raise(Error, 'database is not ready')
  }

  async search(opt: Base.SearchParam): Promise<Base.SearchResult<Id>> {
    const { keyword, page, perPage, mode, ruleset } = opt

    const bMode = toBanchoPyMode(mode, ruleset)
    assertIsBanchoPyMode(bMode)

    const start = page * perPage
    const iNumber = ClanProvider.stringToId(keyword)

    const subQuery = this.drizzle.select({
      pp: schema.stats.pp,
      rankedScore: schema.stats.rankedScore,
      totalScore: schema.stats.totalScore,
      ownerId: schema.clans.ownerId,
      id: schema.clans.id,
      name: schema.clans.name,
      badge: schema.clans.badge,
      createdAt: schema.clans.createdAt,
      userId: sql`${schema.users.id}`.as('userId'),
      userName: sql`${schema.users.name}`.as('userName'),
    }).from(schema.clans)
      .innerJoin(schema.users, and(eq(schema.users.clanId, schema.clans.id), ClanProvider.#userPriv))
      .innerJoin(schema.stats, and(eq(schema.stats.id, schema.users.id), eq(schema.stats.mode, bMode)))
      .where(
        or(
          like(schema.clans.name, `%${keyword}%`),
          like(schema.clans.badge, `%${keyword}%`),
          Number.isNaN(iNumber) ? undefined : eq(schema.clans.id, iNumber)
        ),
      ).as('sq')

    const query = this.drizzle.select({
      ownerId: subQuery.ownerId,
      countUser: sql`count(*)`.mapWith(Number),
      sumPP: sql`sum(${subQuery.pp})`.mapWith(Number),
      sumRankedScore: sql`sum(${subQuery.rankedScore})`.mapWith(BigInt),
      sumTotalScore: sql`sum(${subQuery.totalScore})`.mapWith(BigInt),
      id: subQuery.id,
      name: subQuery.name,
      badge: subQuery.badge,
      createdAt: subQuery.createdAt,
      userNameList: sql<string>`GROUP_CONCAT(REPLACE(${subQuery.userName}, ',', '&#44;') ORDER BY ${subQuery.pp} DESC)`,
      userIdList: sql<string>`GROUP_CONCAT(${subQuery.userId} ORDER BY ${subQuery.pp} DESC)`,
    })
      .from(subQuery)
      .groupBy(schema.clans.id, schema.clans.name, schema.clans.badge, schema.clans.createdAt)
      .offset(start)
      .limit(perPage)

    const [{ count }] = await this.drizzle.select({ count: sql`count(*)`.mapWith(Number) }).from(query.as('selected'))

    const result = await query.execute()

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
            [Rank.PPv2]: a.sumPP,
            [Rank.RankedScore]: a.sumRankedScore,
            [Rank.TotalScore]: a.sumTotalScore,
          },
          countUser: a.countUser,
          owner,
        }
      })),
    ]
  }

  async detail(opt: Base.DetailParam<Id>): Promise<Base.DetailResult<Id>> {
    const result = await this.drizzle.query.clans.findFirst({
      where: (clans, { eq }) => eq(clans.id, opt.id),
      with: {
        owner: {
          columns: {
            name: true,
            id: true,
            safeName: true,
            priv: true,
            country: true,
          },
        },
      },
    }) ?? raise(Error, 'not found')
    const uc = toUserCompact(result.owner, this.config)

    return {
      name: result.name,
      id: result.id,
      badge: result.badge,
      createdAt: result.createdAt,
      owner: toUserCompact(result.owner, this.config),
      avatarSrc: uc.avatarSrc,
      countUser: await this.drizzle.select({ count: sql`count(1)`.mapWith(Number) })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.clanId, result.id),
            ClanProvider.#userPriv
          )
        )
        .then(res => res[0].count),
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
    const users = await this.drizzle.query.users.findMany({
      where: eq(schema.users.clanId, opt.id),
      offset: start,
      limit: opt.perPage,
    })

    return users.map(v => toUserCompact(v, this.config))
  }
}
