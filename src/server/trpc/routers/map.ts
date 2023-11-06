import { object, string } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { MapProvider, maps } from '~/server/singleton/service'

export const router = _router({
  beatmapset: p
    .input(
      object({
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
