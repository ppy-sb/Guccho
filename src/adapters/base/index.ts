import type { AvailableRuleset, Feature, LeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'
import type {
  HasLeaderboardRankingSystem,
  HasRankingSystem,
  HasRuleset,
} from '~/types/server'

export type Id = string
export type ScoreId = string

export const idToString = (id: Id): string => id
export const stringToId = (id: string): Id => id
export const scoreIdToString = (id: Id): string => id
export const stringToScoreId = (id: string): ScoreId => id

export const hasRankingSystem: HasRankingSystem = (
  _1,
  _2,
  rankingSystem,
): rankingSystem is RankingSystem => false

export const hasLeaderboardRankingSystem: HasLeaderboardRankingSystem = (
  _1,
  _2,
  rankingSystem,
): rankingSystem is LeaderboardRankingSystem => false

export const hasRuleset: HasRuleset = <M extends Mode>(
  mode: M,
  ruleset: Ruleset,
): ruleset is AvailableRuleset<M> => false

export const features: Set<Feature> = new Set([])
export { modes, rulesets } from '~/types/defs'
