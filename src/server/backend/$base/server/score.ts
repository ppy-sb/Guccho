import type { idTransformable, scoreIdTransformable } from './@extends'
import type { Mode, PPRankingSystem, Ruleset } from '~/types/common'
import type { RulesetScore } from '~/types/score'
import type { UserEssential } from '~/types/user'

export namespace ScoreProvider {

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

}

export interface ScoreProvider<TScoreId, TId> extends idTransformable, scoreIdTransformable {
  id(id: TScoreId): PromiseLike<
    | (RulesetScore<TScoreId, TId, Mode, Ruleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })
  >
  findOne(opt: ScoreProvider.SearchQueryMany<TId> | ScoreProvider.SearchId<TScoreId>): PromiseLike<
    | (RulesetScore<TScoreId, TId, Mode, Ruleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })
  >
  findMany(opt: ScoreProvider.SearchQueryMany<TId>): PromiseLike<
    (RulesetScore<TScoreId, TId, Mode, Ruleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })[]
  >

}
