import type { LeaderboardRankingSystem, RankingSystem } from '~/types/common'
import type {
  AssertHasLeaderboardRankingSystem,
  AssertHasRankingSystem,
} from '~/types/server'

export type Id = string
export type ScoreId = string

export const assertHasRankingSystem: AssertHasRankingSystem = (
  _1,
  _2,
  rankingSystem,
): rankingSystem is RankingSystem => false
export const assertHasLeaderboardRankingSystem: AssertHasLeaderboardRankingSystem = (
  _1,
  _2,
  rankingSystem,
): rankingSystem is LeaderboardRankingSystem => false
