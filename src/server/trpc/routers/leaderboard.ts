import z from 'zod'

import {
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { LeaderboardProvider, hasRuleset, idToString, stringToId } from '$active'

// import { createRouter } from '../context'
const provider = new LeaderboardProvider()
export const router = _router({
  overall: publicProcedure
    .input(
      z.object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: z.number().gte(0).lt(10),
        pageSize: z.number().gte(20).lt(51),
      }),
    )
    .query(
      async ({ input }) => {
        const { mode, ruleset, rankingSystem, page, pageSize } = input
        if (!hasRuleset(mode, ruleset)) {
          return []
        }
        const result = await provider.getLeaderboard({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
        })
        return result.map(item => ({
          ...item,
          user: Object.assign(item.user, { id: idToString(item.user.id) }),
        }))
      },
    ),
  beatmap: publicProcedure
    .input(
      z.object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: z.number().gte(0).lt(10),
        pageSize: z.number().gte(20).lt(51),
        beatmapId: z.string(),
      }),
    )
    .query(
      async ({
        input: { mode, ruleset, rankingSystem, page, pageSize, beatmapId },
      }) => {
        if (!mode) {
          // TODO return default modes
          mode = 'osu'
          // return []
        }
        if (!hasRuleset(mode, ruleset)) {
          return []
        }
        const result = await provider.getBeatmapLeaderboard({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
          id: stringToId(beatmapId),
        })
        return result.map(item => ({
          ...item,
          user: Object.assign(item.user, { id: idToString(item.user.id) }),
        }))
      },
    ),
})
