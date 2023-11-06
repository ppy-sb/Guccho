import { Mixin } from 'ts-mixer'
import { IdTransformable, ScoreIdTransformable } from './@extends'
import type { ActiveMode, ActiveRuleset, PPRankingSystem } from '~/def/common'
import type { RulesetScore } from '~/def/score'
import type { UserCompact } from '~/def/user'

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

export abstract class ScoreProvider<TScoreId, TId> extends Mixin(IdTransformable, ScoreIdTransformable) {
  abstract id(id: TScoreId): PromiseLike<
    | (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserCompact<TId>
    })
  >
  abstract findOne(opt: ScoreProvider.SearchQueryMany<TId> | ScoreProvider.SearchId<TScoreId>): PromiseLike<
    | (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserCompact<TId>
    })
  >
  abstract findMany(opt: ScoreProvider.SearchQueryMany<TId>): PromiseLike<
    (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserCompact<TId>
    })[]
  >
}
