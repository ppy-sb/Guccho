import type { UserEssential } from './user'
import type { Maybe } from './frontend-common'
import type {
  LeaderboardRankingSystem,
  LeaderboardScoreRankingSystem,
  PPRankingSystem,
} from './common'
import type { Mod } from './score'

export interface Leaderboard<
  IdType,
  _RankingSystem extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> {
  user: UserEssential<IdType>
  inThisLeaderboard: {
    accuracy: number
    playCount: number
    rank: number | bigint
  } & Record<_RankingSystem & PPRankingSystem, number> &
  Record<_RankingSystem & LeaderboardScoreRankingSystem, bigint>
}
export interface BeatmapLeaderboard<Id> {
  user: UserEssential<Id>
  score: {
    id: unknown
    score: number | bigint
    accuracy: number
    playedAt: Date
    mods: Mod[]
  } & Partial<Record<PPRankingSystem, number>>
  rank: number
}

export type ComponentLeaderboard<IdType> = Maybe<
  Leaderboard<IdType>,
  'inThisLeaderboard'
>
