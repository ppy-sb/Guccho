import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import { TRPCError } from '@trpc/server'

import type { DatabaseModel } from '~/adapters/bancho.py/client/user'
import useEditorExtensions from '~/composables/useEditorExtensions'
import { UserDataProvider as BanchoPyImpl } from '~/adapters/bancho.py/client'

import type { PrismaClient } from '~/.prisma/ppy.sb/index'
import type { UserEssential } from '~/types/user'

export class UserDataProvider extends BanchoPyImpl {
  declare db: DatabaseModel & { userpage: PrismaClient['userpage'] }
  constructor({ client }: { client: DatabaseModel & { userpage: PrismaClient['userpage'] } }) {
    super({ client })
    this.db.userpage = client.userpage
  }

  async changeUserpage(user: UserEssential<number>, input: { profile: JSONContent }) {
    const renderExtensions = useEditorExtensions()
    try {
      const html = generateHTML(input.profile, renderExtensions)

      const userpage = await this.db.userpage.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      })
      if (!userpage) {
        const inserted = await this.db.userpage.create({
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
          raw: JSON.parse(inserted.raw ?? '') as JSONContent,
        }
      }
      else {
        const updated = await this.db.userpage.update({
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
          raw: JSON.parse(updated.raw ?? '') as JSONContent,
        }
      }
    }
    catch (err) {
      throw new TRPCError({ code: 'PARSE_ERROR', message: 'unable to parse json content' })
    }
  }
}
