import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { MapDataProvider } from '~/adapters/ppy.sb@bancho.py/client'

const map = new MapDataProvider()
export const router = _router({
  beatmapset: p.input(z.object({
    id: string(),
  })).query(async ({ input }) => {
    const { id } = input
    const bs = await map.getBeatmapset({ id })
    if (!bs)
      return
    return bs
  }),
})
