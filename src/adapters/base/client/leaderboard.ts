import type {
  AvailableRuleset,
  Awaitable,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
} from '~/types/common'
import type {
  BeatmapLeaderboard,
  ComponentLeaderboard,
} from '~/types/leaderboard'

export namespace LeaderboardProvider {
  export interface BaseQuery<M extends Mode = Mode> {
    mode?: M
    ruleset: AvailableRuleset<M>
    page: number
    pageSize: number
  }
}
export interface LeaderboardProvider<Id> {
  getLeaderboard(
    query: Required<LeaderboardProvider.BaseQuery> & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): Awaitable<ComponentLeaderboard<Id>[]>

  getBeatmapLeaderboard(
    query: LeaderboardProvider.BaseQuery & {
      rankingSystem: RankingSystem
      id: Id
    }
  ): Awaitable<BeatmapLeaderboard<Id>[]>
}
