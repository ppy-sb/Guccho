import type { ActiveMode, ActiveRuleset, AvailableRuleset, Feature, LeaderboardRankingSystem, RankingSystem } from '~/types/common'
import type {
  HasLeaderboardRankingSystem,
  HasRankingSystem,
  HasRuleset,
} from '~/types/server'

export type Id = any
export type ScoreId = any

export function idToString(id: Id): string {
  return id
}
export function stringToId(id: string): Id {
  return id
}
export function scoreIdToString(id: Id): string {
  return id
}
export function stringToScoreId(id: string): ScoreId {
  return id
}

export const hasRankingSystem: HasRankingSystem = (
  _1,
  _2,
  rankingSystem
): rankingSystem is RankingSystem => false

export const hasLeaderboardRankingSystem: HasLeaderboardRankingSystem = (
  _1,
  _2,
  rankingSystem
): rankingSystem is LeaderboardRankingSystem => false

export const hasRuleset: HasRuleset = <M extends ActiveMode>(
  mode: M,
  ruleset: ActiveRuleset
): ruleset is AvailableRuleset<M> => false

export const features: Set<Feature> = new Set([])
export { modes, rulesets } from '~/types/defs'
