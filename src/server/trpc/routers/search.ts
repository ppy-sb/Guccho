import { z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { zodSearchBeatmap } from '../shapes'
import { mapId } from '~/server/transforms/mapId'
import { MapProvider, UserProvider } from '~/server/adapters/bancho.py/server'

const map = new MapProvider()
const user = new UserProvider()

export const router = _router({
  searchUser: p
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input: { keyword, limit } }) => {
      const users = await user.search({
        keyword,
        limit,
      })

      return users.map(u => mapId(u, UserProvider.idToString))
    }),
  searchBeatmap: p
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().optional().default(5),
        filters: z.array(zodSearchBeatmap).optional(),
      })
    )
    .query(async ({ input: { keyword, limit, filters } }) => {
      const beatmaps = await map.searchBeatmap({
        keyword,
        limit,
        filters,
      })

      return beatmaps.map(b => mapId(b, MapProvider.idToString))
    }),
  searchBeatmapset: p
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().optional().default(5),
        filters: z.array(zodSearchBeatmap).optional(),
      })
    )
    .query(async ({ input: { keyword, limit, filters } }) => {
      const beatmapsets = await map.searchBeatmapset({
        keyword,
        limit,
        filters,
      })

      return beatmapsets.map(bs => mapId(bs, MapProvider.idToString))
    }),
})
