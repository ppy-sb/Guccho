import type { Maybe } from './frontend-common'
import type { PPRankingSystem, RankingSystem, ScoreRankingSystem } from './common'

export interface LeaderboardItem<IdType, _RankingSystem extends RankingSystem = RankingSystem> {
  user: {
    id: IdType
    name: string
    safeName: string
    flag: string
    avatarUrl: string
    inThisLeaderboard: {
      accuracy: number
      playCount: number
    }
    & Record<_RankingSystem & PPRankingSystem, number>
    & Record<_RankingSystem & ScoreRankingSystem, bigint>
  }
  rank: number | bigint
}

export interface ComponentLeaderboardItem<IdType> {
  rank: number | bigint
  user: Maybe<LeaderboardItem<IdType>['user'], 'inThisLeaderboard'>
}
