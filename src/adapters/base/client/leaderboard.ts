import type { Awaitable, GrandLeaderboardRankingSystem, Mode, PPRankingSystem, Range, Ruleset } from '~/types/common'
import type { ComponentLeaderboardItem } from '~/types/leaderboard'

export namespace LeaderboardDataProvider {
  export interface BaseQuery {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: GrandLeaderboardRankingSystem
    page: Range<0, 10>
    pageSize: Range<20, 51>
  }

  export interface BeatmapLeaderboardItem<Id> {
    user: {
      id: Id
      name: string
      safeName: string
      flag: string
      avatarUrl: string
    }
    score: {
      score: number | bigint
      accuracy: number
    } & Partial<Record<PPRankingSystem, number>>
    rank: number
  }
}
export abstract class LeaderboardDataProvider<Id> {
  abstract getTotalLeaderboard(query: LeaderboardDataProvider.BaseQuery): Awaitable<ComponentLeaderboardItem<Id>[]>

  abstract getBeatmapLeaderboard(query: LeaderboardDataProvider.BaseQuery & {
    id: Id
  }): Awaitable<LeaderboardDataProvider.BeatmapLeaderboardItem<Id>[]>
}
