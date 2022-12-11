import type { RulesetScore } from './score'
import type { Mode, PPRankingSystem, GrandLeaderboardRankingSystem, Ruleset } from './common'

export interface BaseRank<
  Id,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  _RankingSystem extends GrandLeaderboardRankingSystem,
> {
  rank?: number
  rankHistory?: Record<string, number>

  countryRank?: number
  countryRankHistory?: number[]

  accuracy?: number

  bests?: Array<Omit<RulesetScore<bigint, Id, _Mode, _Ruleset, _RankingSystem>, 'mode' | 'ruleset'>>
}

export type PPRank<
  Id,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  _RankingSystem extends GrandLeaderboardRankingSystem,
> = BaseRank<Id, _Mode, _Ruleset, _RankingSystem> & {
  performance: number
  performanceHistory?: Record<string, number>
}

export type ScoreRank<
  Id,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  _RankingSystem extends GrandLeaderboardRankingSystem,
> = BaseRank<Id, _Mode, _Ruleset, _RankingSystem> & {
  score: bigint | null
  scoreHistory?: Record<string, bigint>
}

export type UserModeRulesetStatistics<
  Id,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  RS extends GrandLeaderboardRankingSystem,
> = {
  // TODO: Achievement
  // achievements: Achievement[]
  playCount: number
  playTime: number
  totalHits: number
  level: number
} & {
  [R in RS]: R extends PPRankingSystem ? PPRank<Id, _Mode, _Ruleset, R> : ScoreRank<Id, _Mode, _Ruleset, R>;
}
