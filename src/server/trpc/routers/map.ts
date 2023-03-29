import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { mapId } from '../../transforms/mapId'
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
      const bs = await map.getBeatmapset({ id: map.stringToId(input.id) })
      if (!bs) {
        return
      }
      return {
        ...mapId(bs, map.idToString),
        beatmaps: bs.beatmaps.map(bm => mapId(bm, map.idToString)),
      }
    }),
})
