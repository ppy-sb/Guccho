import { aliasedTable, and, eq, like, not, or, sql } from 'drizzle-orm'
import { zip } from 'lodash-es'
import { $enum } from 'ts-enum-util'
import type { Id } from '..'
import * as schema from '../drizzle/schema'
import { config } from '../env'
import { assertIsBanchoPyMode, idToString, stringToId, toBanchoPyMode, toUserAvatarSrc, toUserCompact } from '../transforms'
import { Logger } from '../log'
import useDrizzle, { userPriv } from './source/drizzle'
import { userNotFound } from '~/server/trpc/messages'
import { users } from '~/server/singleton/service'
import { ClanRelation } from '~/def/clan'
import { Rank } from '~/def'
import { ClanProvider as Base } from '$base/server'

enum BanchopyClanPrivilege {
  Member = 1,
  Officer = 2,
  Owner = 3,
}

const logger = Logger.child({ label: 'clan' })

const iBanchoPyClanPrivilege = $enum(BanchopyClanPrivilege)

const drizzle = await useDrizzle(schema)
export class ClanProvider extends Base<Id> {
  static stringToId = stringToId
  static idToString = idToString

  config = config()

  drizzle = drizzle
  clanLegalPrivFilter = or(
    ...iBanchoPyClanPrivilege.map(priv => eq(schema.users.clanPriv, priv))
  )

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
      userClanPriv: schema.users.clanPriv,
    }).from(schema.clans)
      .innerJoin(schema.users, and(
        eq(schema.users.clanId, schema.clans.id),
        this.clanLegalPrivFilter,
        userPriv(schema.users),

      ))
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
      userNameList: sql<string>`
        GROUP_CONCAT(
          REPLACE(${subQuery.userName}, ',', '&#44;')
          ORDER BY
          ${subQuery.userClanPriv} DESC,
          ${subQuery.pp} DESC
        )
      `,
      userIdList: sql<string>`
        GROUP_CONCAT(
          ${subQuery.userId}
          ORDER BY
            ${subQuery.userClanPriv} DESC,
            ${subQuery.pp} DESC
        )`,
    })
      .from(subQuery)
      .groupBy(schema.clans.id, schema.clans.name, schema.clans.badge, schema.clans.createdAt)

    const [{ count }] = await this.drizzle.select({ count: sql`count(*)`.mapWith(Number) }).from(query.as('selected'))

    const result = await query
      .offset(start)
      .limit(perPage)
      .execute()

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
    const owners = aliasedTable(schema.users, 'owners')
    const query = this.drizzle.select({
      countUser: sql`count(${schema.users.id})`.mapWith(Number),
      owner: {
        id: schema.clans.ownerId,
        name: owners.name,
        safeName: owners.safeName,
        priv: owners.priv,
        country: owners.country,
      },
      clan: {
        id: schema.clans.id,
        name: schema.clans.name,
        badge: schema.clans.badge,
        createdAt: schema.clans.createdAt,
      },
    })
      .from(schema.clans)
      .innerJoin(schema.users, and(eq(schema.users.clanId, schema.clans.id), userPriv(schema.users)))
      .innerJoin(owners, and(eq(schema.clans.ownerId, owners.id), userPriv(owners)))
      .where(eq(schema.clans.id, opt.id))
      .groupBy(schema.clans.id, schema.clans.name, schema.clans.badge, schema.clans.createdAt)

    const [result] = await query.execute()

    const uc = toUserCompact(result.owner, this.config)

    return {
      ...result.clan,
      owner: toUserCompact(result.owner, this.config),
      avatarSrc: uc.avatarSrc,
      countUser: result.countUser,
    }
  }

  async getClanRelation(opt: Base.ChangeRelationRequestParam<Id>) {
    const { userId, clanId } = opt
    const result = await this.drizzle.query.users.findFirst({
      columns: {
        clanPriv: true,
      },
      with: {
        clan: true,
      },
      where: eq(schema.users.id, userId),
    }) ?? raise(Error, userNotFound)

    switch (true) {
      case result.clan === null :
      case result.clan.id === 0 : return ClanRelation.Free

      case result.clan.id === clanId :
        switch (result.clanPriv) {
          case BanchopyClanPrivilege.Member : return ClanRelation.Member
          case BanchopyClanPrivilege.Officer : return ClanRelation.Moderator
          case BanchopyClanPrivilege.Owner : return ClanRelation.Owner

          default:
            logger.error({ message: `unknown clan priv: ${result.clanPriv}` })
            return ClanRelation.Free
        }
      default: return ClanRelation.JoinedOtherClan
    }
  }

  async joinRequest(opt: Base.ChangeRelationRequestParam<Id>) {
    const { userId, clanId } = opt
    // due to no index constraint user clan may point to null
    const result = await this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {},
      with: {
        clan: true,
      },
    }) ?? raise(Error, userNotFound)

    switch (true) {
      case result.clan === null:
      case result.clan.id === 0: {
        const result = await this.drizzle.update(schema.users).set({
          clanId,
          clanPriv: BanchopyClanPrivilege.Member,
        })
          .where(eq(schema.users.id, userId))

        return result[0].affectedRows
          ? ClanRelation.Member
          : ClanRelation.Left
      }
      default: return ClanRelation.JoinedOtherClan
    }
  }

  async leaveRequest(opt: Base.ChangeRelationRequestParam<Id>) {
    const { userId, clanId } = opt
    const result = await this.drizzle.update(schema.users).set({
      clanId: 0,
      clanPriv: 0,
    }).where(
      and(
        eq(schema.users.id, userId),
        eq(schema.users.clanId, clanId),
        not(eq(schema.users.clanPriv, BanchopyClanPrivilege.Owner))
      )
    )

    return result[0].affectedRows
      ? ClanRelation.Left
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
