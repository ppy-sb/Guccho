import type { UserEssential } from './../../../types/user'
import type { Awaitable, Mode, OverallLeaderboardRankingSystem, PPRankingSystem, RankingSystem, Ruleset } from '~/types/common'
import type { ComponentLeaderboard } from '~/types/leaderboard'

export namespace LeaderboardDataProvider {
  export interface BaseQuery {
    mode?: Mode
    ruleset: Ruleset
    page: number
    pageSize: number
  }

  export interface BeatmapLeaderboard<Id> {
    user: UserEssential<Id>
    score: {
      id: unknown
      score: number | bigint
      accuracy: number
      playedAt: Date
    } & Partial<Record<PPRankingSystem, number>>
    rank: number
  }
}
export interface LeaderboardDataProvider<Id> {
  getOverallLeaderboard(query: Required<LeaderboardDataProvider.BaseQuery> & { rankingSystem: OverallLeaderboardRankingSystem }): Awaitable<ComponentLeaderboard<Id>[]>

  getBeatmapLeaderboard(query: LeaderboardDataProvider.BaseQuery & {
    rankingSystem: RankingSystem
    id: Id
  }): Awaitable<LeaderboardDataProvider.BeatmapLeaderboard<Id>[]>
}
