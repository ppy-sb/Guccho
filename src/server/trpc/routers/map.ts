import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { MapDataProvider } from '$active/client'
import { stringToId } from '$active/config'

const map = new MapDataProvider()
export const router = _router({
  beatmapset: p.input(z.object({
    id: string(),
  })).query(async ({ input }) => {
    const bs = await map.getBeatmapset({ id: stringToId(input.id) })
    if (!bs)
      return
    return bs
  }),
})
