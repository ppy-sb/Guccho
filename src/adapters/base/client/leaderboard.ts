import type { Awaitable, GrandLeaderboardRankingSystem, Mode, PPRankingSystem, Range, Ruleset } from '~/types/common'
import type { ComponentLeaderboard } from '~/types/leaderboard'

export namespace LeaderboardDataProvider {
  export interface BaseQuery {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: GrandLeaderboardRankingSystem
    page: Range<0, 10>
    pageSize: Range<20, 51>
  }

  export interface BeatmapLeaderboard<Id> {
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
  abstract getGrand(query: LeaderboardDataProvider.BaseQuery): Awaitable<ComponentLeaderboard<Id>[]>

  abstract getBeatmap(query: LeaderboardDataProvider.BaseQuery & {
    id: Id
  }): Awaitable<LeaderboardDataProvider.BeatmapLeaderboard<Id>[]>
}
