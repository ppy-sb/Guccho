import z from 'zod'
// import { createRouter } from '../context'
import { router as _router, publicProcedure } from '../trpc'
import { zodMode, zodRankingSystem, zodRuleset } from '~/server/trpc/shapes'
import { LeaderboardDataProvider } from '~/adapters/ppy.sb@bancho.py/client'
import type { NumberRange } from '~/types/common'

const provider = new LeaderboardDataProvider()
export const router = _router({
  overall: publicProcedure
    .input(
      z.object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: z.number().gte(0).lt(10),
        pageSize: z.number().gte(20).lt(51),
      }),
    )
    .query(
      async ({ input: { mode, ruleset, rankingSystem, page, pageSize } }) =>
        await provider.getOverallLeaderboard({
          mode,
          ruleset,
          rankingSystem,
          page: page as NumberRange<0, 10>,
          pageSize: pageSize as NumberRange<20, 51>,
        }),
    ),
})
