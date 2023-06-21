import { z } from 'zod'

import {
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { mapId } from '~/server/transforms/mapId'
import { LeaderboardProvider, UserProvider } from '$active/server'
import { hasRuleset } from '$active'

const provider = new LeaderboardProvider()
const u = new UserProvider()

const getLeaderboard = provider.getLeaderboard.bind(provider)
const getBeatmapLeaderboard = provider.getBeatmapLeaderboard.bind(provider)

export const router = _router({
  overallRange: publicProcedure
    .query(() => u.count()),
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
