import type {
  Grade,
  LeaderboardRankingSystem,
  LeaderboardScoreRankingSystem,
  PPRankingSystem,
} from './common'

export interface BaseRank {
  rank?: number
  rankHistory?: Record<string, number>

  countryRank?: number
  countryRankHistory?: number[]

  accuracy?: number
}

export type PPRank = BaseRank & {
  performance: number
  performanceHistory?: Record<string, number>
}

export type ScoreRank = BaseRank & {
  score: bigint | null
  scoreHistory?: Record<string, bigint>
}

export type UserModeRulesetStatistics<RS extends LeaderboardRankingSystem> = {
  // TODO: Achievement
  // achievements: Achievement[]
  playCount: number
  playTime: number
  totalHits: number
  level: number
  maxCombo: number
  replayWatchedByOthers: number
  scoreRankComposition: Record<Grade, number>
} & Record<RS & PPRankingSystem, PPRank> &
Record<RS & LeaderboardScoreRankingSystem, ScoreRank>
