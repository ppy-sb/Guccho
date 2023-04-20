import type { JSONContent } from '@tiptap/core'
import { any, array, literal, object, record, string, union } from 'zod'
import { router as _router } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { optionalUserProcedure } from '../middleware/optional-user'
import { userProcedure } from '../middleware/user'
import { ArticleProvider } from '$active/server'

const sp = new ArticleProvider()
export const router = _router({
  get: userProcedure.input(string()).query(({ input, ctx }) => sp.get({ slug: input, user: ctx.user })),
  getRendered: optionalUserProcedure.input(string()).query(async ({ input, ctx }) => {
    const r = await sp.get({ slug: input, fallback: true, user: ctx.user })
    if (!r) {
      const notFound = sp.fallbacks.get('404')
      return {
        html: notFound?.html,
        access: {
          read: true,
          write: false,
        },
      }
    }
    return {
      html: r.html,
      access: r.access,
    }
  }),
  save: adminProcedure.input(object({
    slug: string(),
    content: record(any(), any()).refine((arg): arg is JSONContent => {
      return !!arg
    }),
    privilege: object({
      read: array(union([literal('staff'), literal('moderator'), literal('beatmapNominator'), literal('public')])),
      write: array(union([literal('staff'), literal('moderator'), literal('beatmapNominator')])),
    }),
  })).mutation(({ input, ctx }) => sp.save(Object.assign(input, { user: ctx.user }))),
  delete: adminProcedure.input(object({
    slug: string(),
  })).mutation(({ input, ctx }) => sp.delete(Object.assign(input, { user: ctx.user }))),
})
