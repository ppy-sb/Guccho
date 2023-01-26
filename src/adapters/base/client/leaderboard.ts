import type { Awaitable, LeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'
import type { BeatmapLeaderboard, ComponentLeaderboard } from '~/types/leaderboard'

export namespace LeaderboardDataProvider {
  export interface BaseQuery {
    mode?: Mode
    ruleset: Ruleset
    page: number
    pageSize: number
  }

}
export interface LeaderboardDataProvider<Id> {
  getLeaderboard(query: Required<LeaderboardDataProvider.BaseQuery> & { rankingSystem: LeaderboardRankingSystem }): Awaitable<ComponentLeaderboard<Id>[]>

  getBeatmapLeaderboard(query: LeaderboardDataProvider.BaseQuery & {
    rankingSystem: RankingSystem
    id: Id
  }): Awaitable<BeatmapLeaderboard<Id>[]>
}
