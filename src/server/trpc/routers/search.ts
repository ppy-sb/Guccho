import { z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { idToString } from '$active/config'
import { MapDataProvider, UserDataProvider } from '$active/client'

const map = new MapDataProvider()
const user = new UserDataProvider()

const replaceId = <T extends { id: Parameters<typeof idToString>[number] }>(bs: T) => ({
  ...bs,
  id: idToString(bs.id),
})

export const router = _router({
  searchUser: p.input(z.object({
    keyword: z.string(),
    limit: z.number().optional().default(10),
  })).query(async ({ input: { keyword, limit } }) => {
    const users = await user.search({
      keyword,
      limit,
    })

    return users.map(replaceId)
  }),
  searchBeatmap: p.input(z.object({
    keyword: z.string(),
    limit: z.number().optional().default(5),
  })).query(async ({ input: { keyword, limit } }) => {
    const beatmaps = await map.searchBeatmap({
      keyword,
      limit,
    })

    return beatmaps.map(replaceId)
  }),
  searchBeatmapset: p.input(z.object({
    keyword: z.string(),
    limit: z.number().optional().default(5),
  })).query(async ({ input: { keyword, limit } }) => {
    const beatmapsets = await map.searchBeatmapset({
      keyword,
      limit,
    })

    return beatmapsets.map(replaceId)
  }),
  // TODO deprecate
  search: p.input(z.object({
    keyword: z.string(),
    limit: z.object({
      user: z.number().optional().default(10),
      beatmaps: z.number().optional().default(10),
    }).optional().default({
      user: 10,
      beatmaps: 5,
    }),
  })).query(async ({ input: { keyword, limit: { user: userLimit, beatmaps: bmLimit } } }) => {
    const [beatmaps, beatmapsets, users] = await Promise.all([
      map.searchBeatmap({
        keyword,
        limit: bmLimit,
      }),
      map.searchBeatmapset({
        keyword,
        limit: bmLimit,
      }),
      user.search({
        keyword,
        limit: userLimit,
      })])

    return {
      beatmaps: beatmaps.map(replaceId),
      beatmapsets: beatmapsets.map(replaceId),
      users: users.map(replaceId),
    }
  }),
})
