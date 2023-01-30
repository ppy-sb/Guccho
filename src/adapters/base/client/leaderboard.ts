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

export namespace LeaderboardDataProvider {
  export interface BaseQuery<M extends Mode = Mode> {
    mode?: M
    ruleset: AvailableRuleset<M>
    page: number
    pageSize: number
  }
}
export interface LeaderboardDataProvider<Id> {
  getLeaderboard(
    query: Required<LeaderboardDataProvider.BaseQuery> & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): Awaitable<ComponentLeaderboard<Id>[]>

  getBeatmapLeaderboard(
    query: LeaderboardDataProvider.BaseQuery & {
      rankingSystem: RankingSystem
      id: Id
    }
  ): Awaitable<BeatmapLeaderboard<Id>[]>
}
