import type { idTransformable } from './@extends'
import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
} from '~/def/common'
import type {
  BeatmapLeaderboard,
  ComponentLeaderboard,
} from '~/def/leaderboard'

export namespace LeaderboardProvider {
  export interface BaseQueryOptionalMode<M extends ActiveMode = ActiveMode> {
    mode?: M
    ruleset: ActiveRuleset
    page: number
    pageSize: number
  }
  export interface BaseQuery<M extends ActiveMode = ActiveMode> {
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
