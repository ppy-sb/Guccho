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
    const [{ beatmaps, beatmapsets }, users] = await Promise.all([map.search({
      keyword,
      limit: bmLimit,
    }), user.search({
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
