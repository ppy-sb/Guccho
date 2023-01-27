import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import { TRPCError } from '@trpc/server'
import type { PrismaClient } from '@prisma/client' // ppy.sb
import type { Id } from '../exports'
import { prismaClient } from './'

import type { UserEssential } from '~/types/user'

import { toFullUser } from '~/adapters/bancho.py/transforms'
import { createUserQuery } from '~/adapters/bancho.py/transforms/db-queries'
import { UserDataProvider as BanchoPyUser } from '~/adapters/bancho.py@mysql5.7/client'
import useEditorExtensions from '~/composables/useEditorExtensions'
import type { UserDataProvider as Base } from '$def/client/user'

export class UserDataProvider extends BanchoPyUser implements Base<Id> {
  sbDb: PrismaClient

  constructor() {
    super()
    this.sbDb = prismaClient
  }

  async changeUserpage(
    user: UserEssential<number>,
    input: { profile: JSONContent },
  ) {
    const renderExtensions = useEditorExtensions()
    try {
      const html = generateHTML(input.profile, renderExtensions)

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
      throw new TRPCError({
        code: 'PARSE_ERROR',
        message: 'unable to parse json content',
      })
    }
  }

  async getFull<
    Excludes extends Partial<
      Record<keyof Base.ComposableProperties<Id>, boolean>
    >,
  >({ handle, excludes }: { handle: string; excludes?: Excludes }) {
    if (!excludes) {
      excludes = <Excludes>{ secrets: true }
    }
    const user = await this.sbDb.user.findFirst(createUserQuery(handle))

    if (user == null) {
      return null
    }

    const fullUser = await toFullUser(user)
    const profile = await this.db.userpage.findFirst({
      where: {
        userId: user.id,
      },
    })

    return {
      ...fullUser,
      reachable: false,
      status: 'offline' as const,
      statistics:
        excludes.statistics === true
          ? (undefined as never)
          : await this.getStatistics(user),
      relationships:
        excludes.relationships === true
          ? (undefined as never)
          : await this.relationships.get({ user }),
      email: excludes.email === true ? (undefined as never) : user.email,
      profile:
        excludes.profile === true
          ? (undefined as never)
          : {
              html: profile?.html || '',
              // TODO: alter database to read/save raw
              raw: JSON.parse(profile?.raw || '{}'),
            },
      secrets:
        excludes.secrets === false
          ? {
              password: user.pwBcrypt,
              apiKey: user.apiKey ?? undefined,
            }
          : (undefined as never),
    }
  }
}
