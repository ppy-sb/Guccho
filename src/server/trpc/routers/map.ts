import { idToString, stringToId } from '$active'
import { string, z } from 'zod'
import { MapProvider } from '~/adapters/ppy.sb@bancho.py/server'

import { publicProcedure as p, router as _router } from '../trpc'

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
