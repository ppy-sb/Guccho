import type { H3Event } from 'h3'
import type { IdTransformable, ScoreIdTransformable } from './@extends'
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

export interface ScoreProvider<TScoreId, TId> extends IdTransformable, ScoreIdTransformable {
  id(id: TScoreId): PromiseLike<
    | (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserCompact<TId>
    })
  >
  findOne(opt: ScoreProvider.SearchQueryMany<TId> | ScoreProvider.SearchId<TScoreId>): PromiseLike<
    | (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserCompact<TId>
    })
  >
  findMany(opt: ScoreProvider.SearchQueryMany<TId>): PromiseLike<
    (RulesetScore<TScoreId, TId, ActiveMode, ActiveRuleset, PPRankingSystem> & {
      user: UserCompact<TId>
    })[]
  >

  downloadReplay(id: bigint, ev: H3Event): Promise<void>

}
