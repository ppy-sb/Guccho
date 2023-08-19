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

export namespace RankProvider {

  export interface Pagination {
    page: number
    pageSize: number
  }

  export interface BaseQueryOptionalMode<M extends ActiveMode = ActiveMode> {
    mode?: M
    ruleset: ActiveRuleset
  }
  export interface BaseQuery<M extends ActiveMode = ActiveMode> {
    mode: M
    ruleset: AvailableRuleset<M>
  }
}

export interface RankProvider<Id> extends idTransformable {
  leaderboard(
    query: RankProvider.BaseQuery & RankProvider.Pagination & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): PromiseLike<ComponentLeaderboard<Id>[]>

  countLeaderboard(
    query: RankProvider.BaseQuery & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): PromiseLike<number>

  beatmap(
    query: RankProvider.BaseQueryOptionalMode & RankProvider.Pagination & {
      rankingSystem: RankingSystem
      md5: string
    }
  ): PromiseLike<BeatmapLeaderboard<Id>[]>

  countBeatmap(
    query: RankProvider.BaseQueryOptionalMode & {
      rankingSystem: RankingSystem
      md5: string
    }
  ): PromiseLike<number>
}
