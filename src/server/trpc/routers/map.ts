import { object, string } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { MapProvider, maps } from '~/server/singleton/service'
import { RankingStatus } from '~/def/beatmap'

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
        ...isLocalMapOrMapset(bs)
          ? mapId(bs, MapProvider.idToString)
          : mapId(bs, MapProvider.idToString, ['id', 'foreignId']),

        beatmaps: bs.beatmaps.map(
          bm => isLocalMapOrMapset(bm)
            ? mapId(bm, MapProvider.idToString)
            : mapId(bm, MapProvider.idToString, ['id', 'foreignId'])
        ),
      }
      return returnValue
    }),

  beatmap: p.input(string().trim()).query(async ({ input }) => {
    const bm = await maps.getBeatmap(input)
    switch (bm.status) {
      case RankingStatus.Deleted:
      case RankingStatus.NotFound: {
        return bm
      }
      default: {
        return isLocalMapOrMapset(bm)
          ? mapId(bm, MapProvider.idToString)
          : mapId(bm, MapProvider.idToString, ['id', 'foreignId'])
      }
    }
  }),
})
