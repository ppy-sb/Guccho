import { string, z } from 'zod'

import { router as _router, publicProcedure as p } from '../trpc'
import { MapProvider } from '$active/server'

const map = new MapProvider()
export const router = _router({
  beatmapset: p
    .input(
      z.object({
        id: string().trim(),
      })
    )
    .query(async ({ input }) => {
      const bs = await map.getBeatmapset({ id: MapProvider.stringToId(input.id) })
      const returnValue = {
        ...mapId(bs, MapProvider.idToString, ['id', 'foreignId']),
        beatmaps: bs.beatmaps.map(bm => mapId(bm, MapProvider.idToString, ['id', 'foreignId'])),
      }
      return returnValue
    }),
})
