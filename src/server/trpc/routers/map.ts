import { array, number, object, string } from 'zod'
import { optionalUserProcedure } from '../middleware/optional-user'
import { userProcedure } from '../middleware/user'
import { zodSearchBeatmap } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { MapProvider, UserProvider, maps } from '~/server/singleton/service'
import { RankingStatus } from '~/def/beatmap'

export const router = _router({
  beatmapset: optionalUserProcedure
    .input(
      object({
        id: string().trim(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const bs = await maps.getBeatmapset({ id: MapProvider.stringToId(input.id) }, ctx.user ? { id: UserProvider.stringToId(ctx.user.id) } : undefined)
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

  metrics: p.query(async () => {
    return maps.metrics()
  }),

  voteBeatmap: userProcedure
    .input(
      object({
        id: string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated')
      }
      return maps.voteMap(MapProvider.stringToId(input.id), {
        id: UserProvider.stringToId(ctx.user.id),
      })
    }),

  searchBeatmap: p
    .input(
      object({
        keyword: string(),
        limit: number().optional().default(5),
        filters: array(zodSearchBeatmap).optional(),
      }),
    )
    .query(async ({ input: { keyword, limit, filters } }) => {
      const beatmaps = await maps.searchBeatmap({
        keyword,
        limit,
        filters,
      })

      return beatmaps.map(b => mapId(b, MapProvider.idToString))
    }),
  searchBeatmapset: p
    .input(
      object({
        keyword: string(),
        limit: number().optional().default(5),
        filters: array(zodSearchBeatmap).optional(),
      }),
    )
    .query(async ({ input: { keyword, limit, filters } }) => {
      const beatmapsets = await maps.searchBeatmapset({
        keyword,
        limit,
        filters,
      })

      return beatmapsets.map(bs => mapId(bs, MapProvider.idToString))
    }),
})
