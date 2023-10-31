import { z } from 'zod'
import {
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { ranks } from '~/server/singleton/service'
import type { RankProvider as Base } from '$base/server/rank'
import { RankProvider } from '$active/server'
import { hasRuleset } from '$active'
import type { ActiveMode } from '~/def/common'

export const router = _router({
  countLeaderboard: publicProcedure
    .input(
      z.object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
      }),
    )
    .query(({ input }) => {
      return ranks.countLeaderboard(input as typeof input & Base.BaseQuery<ActiveMode>)
    }),
  leaderboard: publicProcedure
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
        const result = await ranks.leaderboard({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, RankProvider.idToString),
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
        md5: z.string(),
      }),
    )
    .query(
      async ({
        input: { mode, ruleset, rankingSystem, page, pageSize, md5 },
      }) => {
        const result = await ranks.beatmap({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
          md5,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, RankProvider.idToString),
        }))
      },
    ),
  countBeatmap: publicProcedure
    .input(
      z.object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: z.number().gte(0).lt(10),
        pageSize: z.number().gte(20).lt(51),
        md5: z.string(),
      }),
    )
    .query(
      async ({
        input: { mode, ruleset, rankingSystem, page, pageSize, md5 },
      }) => {
        const result = await ranks.beatmap({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
          md5,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, RankProvider.idToString),
        }))
      },
    ),
})
