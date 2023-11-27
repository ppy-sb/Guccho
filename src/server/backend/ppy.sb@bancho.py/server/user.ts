import { and, eq, or, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import type { Id } from '..'
import getDrizzle, { userPriv } from '../../bancho.py/server/source/drizzle'
import * as schema from '../drizzle/schema'
import { Logger } from '../log'
import { userNotFound } from '~/server/trpc/messages'
import type { UserProvider as Base } from '$base/server'
import type { Mode, Ruleset } from '~/def'
import type { CountryCode } from '~/def/country-code'
import { Scope, type UserCompact, UserRole, UserStatus } from '~/def/user'
import { ArticleProvider, UserProvider as BanchoPyUser } from '~/server/backend/bancho.py/server'
import { fromBanchoPyMode, toFullUser, toUserClan } from '~/server/backend/bancho.py/transforms'

const logger = Logger.child({ label: 'user' })

export class UserProvider extends BanchoPyUser implements Base<Id> {
  #drizzleLoader = getDrizzle(schema)
  get drizzle() {
    return this.#drizzleLoader() ?? raise(Error, 'database is not ready')
  }

  usernamePattern = /^.{2,15}[^\.]$/

  async changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      flag?: CountryCode
      preferredMode?: {
        mode: Mode
        ruleset: Ruleset
      }
    },
  ) {
    const updatedUser = await super.changeSettings(user, input)
    if (!updatedUser.roles.includes(UserRole.Supporter)) {
      updatedUser.roles.push(UserRole.Supporter)
    }
    return updatedUser
  }

  async changeUserpage(
    user: UserCompact<number>,
    input: { profile: ArticleProvider.JSONContent },
  ) {
    const html = await ArticleProvider.render(input.profile)

    const { id = undefined } = await this.drizzle.query.userpages.findFirst({
      where: eq(schema.userpages.userId, user.id),
      columns: {
        id: true,
      },
    }) ?? {}

    const data = {
      userId: user.id,
      html,
      raw: JSON.stringify(input.profile),
      rawType: 'tiptap',
    } as const

    await this.drizzle.insert(schema.userpages)
      .values({
        id,
        ...data,
      }).onDuplicateKeyUpdate({ set: data })

    const updated = await this.drizzle.query.userpages.findFirst({
      where: eq(schema.userpages.userId, user.id),
    }) ?? raise(TRPCError, { code: 'INTERNAL_SERVER_ERROR', message: 'failed saving userpage' })

    return {
      html: updated.html as string,
      raw: JSON.parse(updated.raw ?? '') || {},
    }
  }

  async getFull<Excludes extends Partial<Record<keyof Base.ComposableProperties<Id>, boolean>>>({ handle, excludes, includeHidden, scope }: { handle: string; excludes?: Excludes; includeHidden?: boolean; scope?: Scope }) {
    const nHandle = Number.parseInt(handle)
    const user = await this.drizzle.query.users.findFirst({
      where: and(
        or(
          eq(schema.users.safeName, handle.startsWith('@') ? handle.slice(1) : handle),
          eq(schema.users.name, handle),
          Number.isNaN(nHandle) ? undefined : eq(schema.users.id, nHandle)
        ),
        (includeHidden || scope === Scope.Self) ? sql`1` : userPriv
      ),
      with: {
        clan: true,
      },
    }) ?? raise(Error, userNotFound)

    const fullUser = toFullUser(user, this.config)
    const profile = await this.drizzle.query.userpages.findFirst({
      where: eq(schema.userpages.userId, user.id),
    })
    const [mode, ruleset] = fromBanchoPyMode(user.preferredMode)
    const returnValue = {
      ...fullUser,
      clan: excludes?.clan === true ? (undefined as never) : toUserClan(user).clan,
      preferredMode: {
        mode, ruleset,
      },
      status: UserStatus.Offline as const,

      // oldNames: excludes?.oldNames === true
      //   ? (undefined as never)
      //   : <UserOldName[]>[],

      statistics: excludes?.statistics === true
        ? (undefined as never)
        : await this.getStatistics(fullUser),

      relationships: excludes?.relationships === true
        ? (undefined as never)
        : await this.relationships.get({ user }),

      email: excludes?.email === true
        ? (undefined as never)
        : user.email,

      profile: excludes?.profile === true
        ? (undefined as never)
        : {
            html: profile?.html || '',
            raw: JSON.parse(profile?.raw || '{}'),
          },
    }

    return returnValue
  }

  async getFullWithSettings<
    Excludes extends Partial<Record<keyof Base.ComposableProperties<Id>, boolean>>,
    _Scope extends Scope = Scope.Public,
  >(query: { handle: string; excludes?: Excludes; includeHidden?: boolean; scope: _Scope }) {
    const fullUser = await this.getFull(query)
    if (!fullUser.roles.includes(UserRole.Supporter)) {
      fullUser.roles.push(UserRole.Supporter)
    }
    return fullUser
  }
}
