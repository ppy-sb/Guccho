import type { Mode, Range, RankingSystem, Ruleset } from '~/types/common'

import type { BaseUser } from '~~/src/types/user'

export abstract class LeaderboardDataProvider<Id> {
  abstract getLeaderboard({
    mode,
    ruleset,
    rankingSystem,
    page,
    pageSize,
  }: {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: RankingSystem
    page: Range<0, 10>
    pageSize: Range<20, 51>
  }): Promise<{
    user: Omit<BaseUser<Id>, 'ingameId' | 'roles'> & {
      inThisLeaderboard: {
        ppv2: number
        accuracy: number
        totalScore: bigint
        rankedScore: bigint
        playCount: number
      }
    }
    rank: bigint
  }[]>
}
