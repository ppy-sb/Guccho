import z from 'zod'

import {
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { mapId } from '~/server/transforms/mapId'
import { LeaderboardProvider } from '$active/server'
import { hasRuleset } from '$active'

const provider = new LeaderboardProvider()

const getLeaderboard = provider.getLeaderboard.bind(provider)
const getBeatmapLeaderboard = provider.getBeatmapLeaderboard.bind(provider)
// const getLeaderboard = memoize(arg => provider.getLeaderboard(arg), {
//   promise: true,
//   maxAge: 10 * 60 * 1000,
//   normalizer(args) {
//     return stringify(args[0])
//   },
// })
// const getBeatmapLeaderboard = memoize((arg: Parameters<typeof provider.getBeatmapLeaderboard>[0]) => provider.getBeatmapLeaderboard(arg), {
//   promise: true,
//   maxAge: 10 * 60 * 1000,
//   normalizer(args: Parameters<typeof provider.getBeatmapLeaderboard>) {
//     return stringify(args[0])
//   },
// })
export const router = _router({
  overall: publicProcedure
    .input(
      z.object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: z.number().gte(0).lt(10),
        pageSize: z.number().gte(20).lt(51),
      })
    )
    .query(
      async ({ input }) => {
        const { mode, ruleset, rankingSystem, page, pageSize } = input
        if (!hasRuleset(mode, ruleset)) {
          return []
        }
        const result = await getLeaderboard({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, LeaderboardProvider.idToString),
        }))
      }
    ),
  beatmap: publicProcedure
    .input(
      z.object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: z.number().gte(0).lt(10),
        pageSize: z.number().gte(20).lt(51),
        md5: z.string(),
      })
    )
    .query(
      async ({
        input: { mode, ruleset, rankingSystem, page, pageSize, md5 },
      }) => {
        const result = await getBeatmapLeaderboard({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
          md5,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, LeaderboardProvider.idToString),
        }))
      }
    ),
})
