import type { idTransformable } from './@extends'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,
} from '~/types/common'
import type {
  BeatmapLeaderboard,
  ComponentLeaderboard,
} from '~/types/leaderboard'

export namespace LeaderboardProvider {
  export interface BaseQueryOptionalMode<M extends Mode = Mode> {
    mode?: M
    ruleset: Ruleset
    page: number
    pageSize: number
  }
  export interface BaseQuery<M extends Mode = Mode> {
    mode: M
    ruleset: AvailableRuleset<M>
    page: number
    pageSize: number
  }
}

export interface LeaderboardProvider<Id> extends idTransformable {
  getLeaderboard(
    query: LeaderboardProvider.BaseQuery & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): PromiseLike<ComponentLeaderboard<Id>[]>

  getBeatmapLeaderboard(
    query: LeaderboardProvider.BaseQueryOptionalMode & {
      rankingSystem: RankingSystem
      md5: string
    }
  ): PromiseLike<BeatmapLeaderboard<Id>[]>
}
