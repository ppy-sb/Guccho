import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { mapId } from '~/server/transforms/mapId'
import { MapProvider } from '~/server/backend/bancho.py/server'

const map = new MapProvider()
export const router = _router({
  beatmapset: p
    .input(
      z.object({
        id: string(),
      })
    )
    .query(async ({ input }) => {
      const bs = await map.getBeatmapset({ id: MapProvider.stringToId(input.id) })
      if (!bs) {
        return
      }
      const returnValue = {
        ...mapId(bs, MapProvider.idToString, ['id', 'foreignId']),
        beatmaps: bs.beatmaps.map(bm => mapId(bm, MapProvider.idToString, ['id', 'foreignId'])),
      }
      return returnValue
    }),
})
