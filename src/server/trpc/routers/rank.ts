import { number, object, string } from 'zod'
import {
  zodCountryCode,
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { RankProvider, ranks } from '~/server/singleton/service'
import type { RankProvider as Base } from '$base/server/rank'
import { type ActiveMode, hasRuleset } from '$active'

export const router = _router({
  countLeaderboard: publicProcedure
    .input(
      object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        country: zodCountryCode.optional(),
      }),
    )
    .query(({ input }) => {
      return ranks.countLeaderboard(input as typeof input & Base.BaseQuery<ActiveMode>)
    }),
  leaderboard: publicProcedure
    .input(
      object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        pageSize: number().gte(20).lt(51),
        country: zodCountryCode.optional(),
      }),
    )
    .query(
      async ({ input }) => {
        const { mode, ruleset, rankingSystem, page, pageSize, country } = input
        if (!hasRuleset(mode, ruleset)) {
          return []
        }
        const result = await ranks.leaderboard({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
          country,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, RankProvider.idToString),
        }))
      },
    ),
  beatmap: publicProcedure
    .input(
      object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: number().gte(0).lt(10),
        pageSize: number().gte(20).lt(51),
        md5: string(),
        country: zodCountryCode.optional(),
      }),
    )
    .query(
      async ({
        input: { mode, ruleset, rankingSystem, page, pageSize, md5, country },
      }) => {
        const result = await ranks.beatmap({
          mode,
          ruleset,
          rankingSystem,
          page,
          pageSize,
          md5,
          country,
        })
        return result.map(item => ({
          ...item,
          user: mapId(item.user, RankProvider.idToString),
        }))
      },
    ),
  countBeatmap: publicProcedure
    .input(
      object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        md5: string(),
        country: zodCountryCode.optional(),
      }),
    )
    .query(
      async ({
        input: { mode, ruleset, rankingSystem, md5, country },
      }) => {
        const result = await ranks.countBeatmap({
          mode,
          ruleset,
          rankingSystem,
          md5,
          country,
        })
        return result
      },
    ),
})
