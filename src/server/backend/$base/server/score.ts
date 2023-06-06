import type { idTransformable, scoreIdTransformable } from './@extends'
import type { ActiveMode, ActiveRuleset, PPRankingSystem } from '~/types/common'
import type { RulesetScore } from '~/types/score'
import type { UserEssential } from '~/types/user'

export namespace ScoreProvider {

  export interface SearchQueryMany<TId> {
    beatmap: {
      id: TId
    }
    mode: ActiveMode
    ruleset: ActiveRuleset
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
    | (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })
  >
  findOne(opt: ScoreProvider.SearchQueryMany<TId> | ScoreProvider.SearchId<TScoreId>): PromiseLike<
    | (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })
  >
  findMany(opt: ScoreProvider.SearchQueryMany<TId>): PromiseLike<
    (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserEssential<TId>
    })[]
  >

}
