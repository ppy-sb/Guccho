import type { RulesetScore } from '~/types/score'
import type { Awaitable, Mode, PPRankingSystem, Ruleset } from '~/types/common'
import type { UserEssential } from '~/types/user'

export interface SearchQueryMany<TId> {
  beatmap: {
    id: TId
  }
  mode: Mode
  ruleset: Ruleset
  user:
  | {
    id: TId
  }
  | {
    safeName: string
  }
}

export interface SearchId<TScroreId> {
  id: TScroreId
}

export interface ScoreProvider<TScoreId, TId> {
  id(
    id: TScoreId
  ): Awaitable<
    | (RulesetScore<TScoreId, TId, Mode, Ruleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })
    | null
  >
  findOne(
    opt: SearchQueryMany<TId> | SearchId<TScoreId>
  ): Awaitable<
    | (RulesetScore<TScoreId, TId, Mode, Ruleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })
    | null
  >
  findMany(
    opt: SearchQueryMany<TId>
  ): Awaitable<
    (RulesetScore<TScoreId, TId, Mode, Ruleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })[]
  >
}
