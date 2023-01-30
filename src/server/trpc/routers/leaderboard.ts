import z from 'zod'
// import { createRouter } from '../context'
import { router as _router, publicProcedure } from '../trpc'
import {
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes/index'
import { assertHasRuleset, idToString, stringToId } from '$active/exports'
import { LeaderboardDataProvider } from '$active/client'

const provider = new LeaderboardDataProvider()
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
        if (!assertHasRuleset(mode, ruleset)) {
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
        if (!assertHasRuleset(mode, ruleset)) {
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
