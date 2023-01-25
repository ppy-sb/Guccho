import type { RulesetScore } from '~/types/score'
import type { Awaitable, Mode, PPRankingSystem, Ruleset } from '~/types/common'

export type SearchParam<TScroreId, TBeatmapId> = {
  id: TScroreId
} | {
  beatmap: TBeatmapId
  user: {
    id: TScroreId
  } | {
    safeName: string
  }
}

export interface ScoreProvider<TScoreId, TBeatmapId> {
  id(id: TScoreId): Awaitable<RulesetScore<TScoreId, TBeatmapId, Mode, Ruleset, PPRankingSystem>>
  findOne(opt: SearchParam<TScoreId, TBeatmapId>): Awaitable<RulesetScore<TScoreId, TBeatmapId, Mode, Ruleset, PPRankingSystem>>
  findMany(opt: SearchParam<TScoreId, TBeatmapId>): Awaitable<RulesetScore<TScoreId, TBeatmapId, Mode, Ruleset, PPRankingSystem>[]>
}
