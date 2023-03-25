import { z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { mapId } from '../../mapInstance'
import { MapProvider, UserProvider } from '$active/server'

const map = new MapProvider()
const user = new UserProvider()

export const router = _router({
  searchUser: p
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().optional().default(10),
      }),
    )
    .query(async ({ input: { keyword, limit } }) => {
      const users = await user.search({
        keyword,
        limit,
      })

      return users.map(u => mapId(u, user.idToString))
    }),
  searchBeatmap: p
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().optional().default(5),
      }),
    )
    .query(async ({ input: { keyword, limit } }) => {
      const beatmaps = await map.searchBeatmap({
        keyword,
        limit,
      })

      return beatmaps.map(b => mapId(b, map.idToString))
    }),
  searchBeatmapset: p
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().optional().default(5),
      }),
    )
    .query(async ({ input: { keyword, limit } }) => {
      const beatmapsets = await map.searchBeatmapset({
        keyword,
        limit,
      })

      return beatmapsets.map(bs => mapId(bs, map.idToString))
    }),
})
