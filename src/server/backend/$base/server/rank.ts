import { IdTransformable } from './@extends'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
} from '$active'
import type {
  BeatmapLeaderboard,
  ComponentLeaderboard,
} from '~/def/leaderboard'
import type { Mode, Ruleset } from '~/def'

export namespace RankProvider {

  export interface Pagination {
    page: number
    pageSize: number
  }

  export interface BaseQueryOptionalMode<M extends Mode = Mode> {
    mode?: M
    ruleset: Ruleset
  }
  export interface BaseQuery<M extends Mode = Mode> {
    mode: M
    ruleset: AvailableRuleset<M>
  }
}

export abstract class RankProvider<Id> extends IdTransformable {
  abstract leaderboard(
    query: RankProvider.BaseQuery & RankProvider.Pagination & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): Promise<ComponentLeaderboard<Id>[]>

  abstract countLeaderboard(
    query: RankProvider.BaseQuery & {
      rankingSystem: LeaderboardRankingSystem
    }
  ): Promise<number>

  abstract beatmap(
    query: RankProvider.BaseQueryOptionalMode & RankProvider.Pagination & {
      rankingSystem: RankingSystem
      md5: string
    }
  ): Promise<BeatmapLeaderboard<Id>[]>

  abstract countBeatmap(
    query: RankProvider.BaseQueryOptionalMode & {
      rankingSystem: RankingSystem
      md5: string
    }
  ): Promise<number>
}
