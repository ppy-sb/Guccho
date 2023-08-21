import { TRPCError } from '@trpc/server'
import type { Id } from '..'
import { Logger } from '../log'
import { getPrismaClient } from './prisma'

import { BanchoPyPrivilege } from '~/server/backend/bancho.py/enums'
import { ArticleProvider, UserProvider as BanchoPyUser } from '~/server/backend/bancho.py/server'
import { fromCountryCode, toFullUser, toSafeName, toUserCompact } from '~/server/backend/bancho.py/transforms'
import { createUserQuery } from '~/server/backend/bancho.py/db-query'

import type { Scope, UserCompact, UserOldName } from '~/def/user'
import { UserPrivilege, UserStatus } from '~/def/user'

import { type UserProvider as Base } from '$base/server'
import type { CountryCode } from '~/def/country-code'

const logger = Logger.child({ label: 'user' })

export class UserProvider extends BanchoPyUser implements Base<Id> {
  sbDb = getPrismaClient()

  async changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      flag?: CountryCode
    }
  ) {
    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: input.email,
        name: input.name,
        safeName: input.name && toSafeName(input.name),
        country: input.flag && fromCountryCode(input.flag),
      },
    })
    const updatedUser = toUserCompact(result, this.config)
    if (!updatedUser.roles.includes(UserPrivilege.Supporter)) {
      updatedUser.roles.push(UserPrivilege.Supporter)
    }
    return updatedUser
  }

  async changeUserpage(
    user: UserCompact<number>,
    input: { profile: ArticleProvider.JSONContent }
  ) {
    try {
      const html = await ArticleProvider.render(input.profile)

      const userpage = await this.sbDb.userpage.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      })
      if (!userpage) {
        const inserted = await this.sbDb.userpage.create({
          data: {
            userId: user.id,
            html,
            raw: JSON.stringify(input.profile),
            rawType: 'tiptap',
          },
        })
        if (!inserted.id) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'unable to save',
          })
        }

        return {
          html: inserted.html as string,
          raw: JSON.parse(inserted.raw ?? '') || {},
        }
      }
      else {
        const updated = await this.sbDb.userpage.update({
          where: {
            id: userpage.id,
          },
          data: {
            html,
            raw: JSON.stringify(input.profile),
          },
        })
        return {
          html: updated.html as string,
          raw: JSON.parse(updated.raw ?? '') || {},
        }
      }
    }
    catch (err) {
      logger.error(err)
      throw new TRPCError({
        code: 'PARSE_ERROR',
        message: 'unable to process your request at this moment.',
      })
    }
  }

  async getFull<
  Excludes extends Partial<Record<keyof Base.ComposableProperties<Id>, boolean>>,
  _Scope extends Scope = Scope.Public,
  >({ handle, excludes, includeHidden, scope }: { handle: string; excludes?: Excludes; includeHidden?: boolean; scope?: _Scope }) {
    const user = await this.sbDb.user.findFirstOrThrow(createUserQuery({
      handle,
      privilege: includeHidden ? BanchoPyPrivilege.Any : undefined,
    }))

    const fullUser = toFullUser(user, this.config)
    const profile = await this.sbDb.userpage.findFirst({
      where: {
        userId: user.id,
      },
    })

    const returnValue = {
      ...fullUser,
      reachable: false,
      status: UserStatus.Offline as const,

      oldNames: excludes?.oldNames === true
        ? (undefined as never)
        : <UserOldName[]>[],

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
    if (!fullUser.roles.includes(UserPrivilege.Supporter)) {
      fullUser.roles.push(UserPrivilege.Supporter)
    }
    return fullUser
  }
}
