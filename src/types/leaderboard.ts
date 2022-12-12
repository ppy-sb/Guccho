import type { Maybe } from './frontend-common'
import type { GrandLeaderboardRankingSystem, GrandLeaderboardScoreRankingSystem, PPRankingSystem } from './common'

export interface Leaderboard<IdType, _RankingSystem extends GrandLeaderboardRankingSystem = GrandLeaderboardRankingSystem> {
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
    & Record<_RankingSystem & GrandLeaderboardScoreRankingSystem, bigint>
  }
  rank: number | bigint
}

export interface ComponentLeaderboard<IdType> {
  rank: number | bigint
  user: Maybe<Leaderboard<IdType>['user'], 'inThisLeaderboard'>
}
