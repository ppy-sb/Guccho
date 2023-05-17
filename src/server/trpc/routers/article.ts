import { any, array, boolean, literal, object, record, string, union } from 'zod'
import { router as _router } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { optionalUserProcedure } from '../middleware/optional-user'
import { userProcedure } from '../middleware/user'
import { ArticleProvider } from '~/server/backend/bancho.py/server'

const sp = new ArticleProvider()
export const router = _router({
  get: userProcedure.input(string()).query(({ input, ctx }) => sp.get({ slug: input, user: ctx.user })),
  getRendered: optionalUserProcedure.input(string()).query(async ({ input, ctx }) => {
    const r = await sp.get({ slug: input, fallback: true, user: ctx.user })
    if (!r) {
      const notFound = sp.fallbacks.get('404')
      if (!notFound) {
        throw new Error('404 not found')
      }
      const html = notFound.dynamic ? sp.render(notFound.json) : notFound.html

      return {
        html,
        access: {
          read: true,
          write: false,
        },
      }
    }
    return {
      html: r.dynamic ? sp.render(r.json) : r.html,
      access: r.access,
    }
  }),
  save: adminProcedure.input(object({
    slug: string(),
    json: record(any(), any()).refine((arg): arg is ArticleProvider.JSONContent => {
      return !!arg
    }),
    privilege: object({
      read: array(union([literal('staff'), literal('moderator'), literal('beatmapNominator'), literal('public')])),
      write: array(union([literal('staff'), literal('moderator'), literal('beatmapNominator')])),
    }),
    dynamic: boolean(),
  })).mutation(({ input, ctx }) => sp.save(Object.assign(input, { user: ctx.user }))),
  delete: adminProcedure.input(object({
    slug: string(),
  })).mutation(({ input, ctx }) => sp.delete(Object.assign(input, { user: ctx.user }))),
})
