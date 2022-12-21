import type { UserEssential } from './user'
import type { Maybe } from './frontend-common'
import type { OverallLeaderboardRankingSystem, OverallLeaderboardScoreRankingSystem, PPRankingSystem } from './common'

export interface Leaderboard<IdType, _RankingSystem extends OverallLeaderboardRankingSystem = OverallLeaderboardRankingSystem> {
  user: UserEssential<IdType>
  inThisLeaderboard: {
    accuracy: number
    playCount: number
    rank: number | bigint
  }
  & Record<_RankingSystem & PPRankingSystem, number>
  & Record<_RankingSystem & OverallLeaderboardScoreRankingSystem, bigint>
}

export type ComponentLeaderboard<IdType> = Maybe<Leaderboard<IdType>, 'inThisLeaderboard'>
