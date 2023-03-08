import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { idToString, stringToId } from '$active'
import { MapProvider } from '$active/server'

const map = new MapProvider()
export const router = _router({
  beatmapset: p
    .input(
      z.object({
        id: string(),
      }),
    )
    .query(async ({ input }) => {
      const bs = await map.getBeatmapset({ id: stringToId(input.id) })
      if (!bs) {
        return
      }
      return {
        ...bs,
        id: idToString(bs.id),
        beatmaps: bs.beatmaps.map(bm => ({ ...bm, id: idToString(bm.id) })),
      }
    }),
})
