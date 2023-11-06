import { number, object, string } from 'zod'
import {
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingSystem,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { RankProvider, ranks } from '~/server/singleton/service'
import type { RankProvider as Base } from '$base/server/rank'
import { hasRuleset } from '$active'
import type { ActiveMode } from '~/def/common'

export const router = _router({
  countLeaderboard: publicProcedure
    .input(
      object({
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
      object({
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        pageSize: number().gte(20).lt(51),
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
      object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: number().gte(0).lt(10),
        pageSize: number().gte(20).lt(51),
        md5: string(),
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
      object({
        mode: zodMode.optional(),
        ruleset: zodRuleset,
        rankingSystem: zodRankingSystem,
        page: number().gte(0).lt(10),
        pageSize: number().gte(20).lt(51),
        md5: string(),
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
