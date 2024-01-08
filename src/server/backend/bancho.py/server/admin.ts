import { and, desc, eq, sql } from 'drizzle-orm'
import type { Id } from '..'
import { encryptBanchoPassword } from '../crypto'
import * as schema from '../drizzle/schema'
import { config } from '../env'
import { fromCountryCode, toBanchoPyPriv, toSafeName, toUserCompact, toUserOptional } from '../transforms'
import { Logger } from '../log'
import { useDrizzle } from './source/drizzle'
import { userNotFound } from './../../../trpc/messages/index'
import { type UserClan, type UserCompact, type UserOptional, UserRole, type UserSecrets } from '~/def/user'
import { AdminProvider as Base } from '$base/server'

const logger = Logger.child({ label: 'user' })

// eslint-disable-next-line n/prefer-global/process
const drizzle = useDrizzle(schema, { logger: !!process.env.DEV })
export class AdminProvider extends Base<Id> implements Base<Id> {
  config = config()
  drizzle = drizzle
  logger = logger
  async userList(query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> & Partial<UserSecrets> & {
    page: number
    perPage: number
  }) {
    const cond = [
      query.id ? eq(schema.users.id, query.id) : undefined,
      query.name ? eq(schema.users.name, query.name) : undefined,
      query.safeName ? eq(schema.users.safeName, query.safeName) : undefined,
      query.email ? eq(schema.users.email, query.email) : undefined,
      query.flag ? eq(schema.users.country, query.flag) : undefined,
      query.roles?.length ? sql`${schema.users.priv} & ${toBanchoPyPriv(query.roles)} = ${toBanchoPyPriv(query.roles)}` : undefined,
      query.roles?.includes(UserRole.Restricted) ? sql`${schema.users.priv} & 1 = 0` : undefined,
    ]

    const baseQuery = this.drizzle.select({
      user: pick(schema.users, ['id', 'name', 'safeName', 'priv', 'country', 'email', 'preferredMode', 'lastActivity', 'creationTime']),
      clan: pick(schema.clans, ['id', 'name', 'badge']),
    }).from(schema.users)
      .leftJoin(schema.clans, eq(schema.clans.id, schema.users.clanId))
      .where(
        and(
          ...cond
        )
      )
      .orderBy(desc(schema.users.lastActivity))
      .offset(query.page * query.perPage)
      .limit(query.perPage)

    const uCompacts = baseQuery.then(res => res.map(({ user, clan }) => ({
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
      lastActivityAt: new Date(user.lastActivity * 1000),
      registeredAt: new Date(user.creationTime * 1000),
      clan: clan
        ? {
          id: clan.id,
          name: clan.name,
          badge: clan.badge,
        } satisfies UserClan<Id>
        : undefined,
    }))) satisfies Promise<Array<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'> & {
      registeredAt: Date
      lastActivityAt: Date
      clan?: UserClan<Id>
    }>>

    return Promise.all([

      this.drizzle.select({
        count: sql`count(*)`.mapWith(Number),
      }).from(schema.users)
        .leftJoin(schema.clans, eq(schema.clans.id, schema.users.clanId))
        .where(
          and(...cond)
        ).execute()
        .then(res => res[0].count),

      uCompacts,

    ] as const)
  }

  async userDetail(query: { id: Id }): Promise<UserCompact<Id> & UserOptional> {
    const user = await this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, query.id),
    }) ?? raise(Error, userNotFound)

    return {
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
    }
  }

  async updateUserDetail(query: { id: Id }, updateFields: Partial<UserCompact<Id> & UserOptional & UserSecrets>): Promise<UserCompact<Id> & UserOptional> {
    await this.drizzle.update(schema.users)
      .set({
        id: updateFields.id,
        name: updateFields.name,
        safeName: updateFields.name ? toSafeName(updateFields.name) : undefined,
        pwBcrypt: updateFields.password ? await encryptBanchoPassword(updateFields.password) : undefined,
        email: updateFields.email,
        country: updateFields.flag ? fromCountryCode(updateFields.flag) : undefined,
        priv: updateFields.roles ? toBanchoPyPriv(updateFields.roles) : undefined,
      })
      .where(eq(schema.users.id, query.id))

    const user = await this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, updateFields.id ?? query.id),
    }) ?? raise(Error, 'cannot find updated user. Did you changed user id?')

    return {
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
    }
  }
}
