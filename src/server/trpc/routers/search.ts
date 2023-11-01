import { array, number, object, string } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { zodSearchBeatmap } from '../shapes'
import { maps, users } from '~/server/singleton/service'
import { MapProvider, UserProvider } from '$active/server'

export const router = _router({
  searchUser: p
    .input(
      object({
        keyword: string(),
        limit: number().optional().default(10),
      }),
    )
    .query(async ({ input: { keyword, limit } }) => {
      const results = await users.search({
        keyword,
        limit,
      })

      return results.map(u => mapId(u, UserProvider.idToString))
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
