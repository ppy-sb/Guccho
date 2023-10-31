import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { maps } from '~/server/singleton/service'
import { MapProvider } from '$active/server'

export const router = _router({
  beatmapset: p
    .input(
      z.object({
        id: string().trim(),
      }),
    )
    .query(async ({ input }) => {
      const bs = await maps.getBeatmapset({ id: MapProvider.stringToId(input.id) })
      const returnValue = {
        ...mapId(bs, MapProvider.idToString, ['id', 'foreignId']),
        beatmaps: bs.beatmaps.map(bm => mapId(bm, MapProvider.idToString, ['id', 'foreignId'])),
      }
      return returnValue
    }),
  beatmap: p.input(string().trim()).query(async ({ input }) => {
    const bm = await maps.getBeatmap(input)
    return mapId(bm, MapProvider.idToString, ['id', 'foreignId'])
  }),
})
