import type { JSONContent } from '@tiptap/core'
import { any, object, record, string } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { ArticleProvider } from '$active/server'

const sp = new ArticleProvider()
export const router = _router({
  get: p.input(string()).query(({ input }) => sp.get({ slug: input })),
  getRendered: p.input(string()).query(({ input }) => sp.get({ slug: input, fallback: true }).then(res => res?.html || sp.fallbacks.get('404')?.html)),
  save: adminProcedure.input(object({
    slug: string(),
    content: record(any(), any()).refine((arg): arg is JSONContent => {
      return !!arg
    }),
  })).mutation(({ input, ctx }) => sp.save(Object.assign(input, { user: ctx.user }))),
})
