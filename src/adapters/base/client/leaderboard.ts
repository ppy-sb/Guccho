import type { Awaitable, GrandLeaderboardRankingSystem, Mode, NumberRange, PPRankingSystem, Ruleset } from '~/types/common'
import type { ComponentLeaderboard } from '~/types/leaderboard'

export namespace LeaderboardDataProvider {
  export interface BaseQuery {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: GrandLeaderboardRankingSystem
    page: NumberRange<0, 10>
    pageSize: NumberRange<20, 51>
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
export interface LeaderboardDataProvider<Id> {
  getGrandLeaderboard(query: LeaderboardDataProvider.BaseQuery): Awaitable<ComponentLeaderboard<Id>[]>

  getBeatmapLeaderboard(query: LeaderboardDataProvider.BaseQuery & {
    id: Id
  }): Awaitable<LeaderboardDataProvider.BeatmapLeaderboard<Id>[]>
}
