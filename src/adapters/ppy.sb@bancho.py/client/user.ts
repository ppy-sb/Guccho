import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import { TRPCError } from '@trpc/server'
import type { PrismaClient } from '@prisma/client' // ppy.sb
import type { Id } from '../config'
import { prismaClient } from './index'
import type { UserEssential } from '~/types/user'
import { UserDataProvider as BanchoPyUser } from '~/adapters/bancho.py/client'
import useEditorExtensions from '~/composables/useEditorExtensions'
import type { UserDataProvider as Base } from '$def/client/user'

export class UserDataProvider extends BanchoPyUser implements Base<Id> {
  sbDb: PrismaClient

  constructor() {
    super()
    this.sbDb = prismaClient
  }

  async changeUserpage(user: UserEssential<number>, input: { profile: JSONContent }) {
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
        if (!inserted.id)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'unable to save' })

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
      throw new TRPCError({ code: 'PARSE_ERROR', message: 'unable to parse json content' })
    }
  }
}
