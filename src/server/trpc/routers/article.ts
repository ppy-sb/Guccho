import { any, object, string } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { ArticleProvider } from '$active/server'

const sp = new ArticleProvider()
export const router = _router({
  get: p.input(string()).query(({ input }) => sp.get(input)),
  getRendered: p.input(string()).query(({ input }) => sp.get(input, true).then(res => res?.html || sp.fallbacks.get('404')?.html)),
  save: p.input(object({
    slug: string(),
    content: any(),
  })).mutation(({ input }) => sp.save(input.slug, input.content)),
})
