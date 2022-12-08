import z from 'zod'
// import { createRouter } from '../context'
import { router as _router, publicProcedure } from '../trpc'
import type { IdType } from '../config'
import { zodMode, zodRankingSystem, zodRuleset } from '~/server/trpc/shapes'
import type { ComponentLeaderboardItem } from '~/types/leaderboard'
import Leaderboard from '$/client/leaderboard'
import type { Range } from '~/types/common'

const provider = new Leaderboard()
export const router = _router({
  fetch: publicProcedure
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
        (await provider.getLeaderboard({
          mode,
          ruleset,
          rankingSystem,
          page: page as Range<0, 10>,
          pageSize: pageSize as Range<20, 51>,
        })) as Array<ComponentLeaderboardItem<IdType>>,
    ),
})
