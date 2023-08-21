import type { UserCompact } from './user'
import type {
  LeaderboardRankingSystem,
  LeaderboardScoreRankingSystem,
  PPRankingSystem,
} from './common'
import type { Mod } from './score'

export interface Leaderboard<
  IdType,
  RankingSystem extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> {
  user: UserCompact<IdType>
  inThisLeaderboard: {
    accuracy: number
    playCount: number
    rank: number | bigint
  }
  & Record<RankingSystem & PPRankingSystem, number>
  & Record<RankingSystem & LeaderboardScoreRankingSystem, bigint>
}
export interface BeatmapLeaderboard<Id> {
  user: UserCompact<Id>
  score: {
    id: unknown
    score: number | bigint
    accuracy: number
    playedAt: Date
    mods: Mod[]
  } & Partial<Record<PPRankingSystem, number>>
  rank: number
}

export type ComponentLeaderboard<Id> = Omit<Leaderboard<Id>, 'inThisLeaderboard'> & {
  inThisLeaderboard: Partial<Leaderboard<Id>['inThisLeaderboard']>
  & Pick<Leaderboard<Id>['inThisLeaderboard'], 'accuracy' | 'playCount'>
}
