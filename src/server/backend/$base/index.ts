import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
} from '~/def/common'
import type { Feature } from '~/def/features'
import type {
  HasLeaderboardRankingSystem,
  HasRankingSystem,
  HasRuleset,
} from '~/def/server'

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
  rankingSystem,
): rankingSystem is RankingSystem => false

export const hasLeaderboardRankingSystem: HasLeaderboardRankingSystem = (
  _1,
  _2,
  rankingSystem,
): rankingSystem is LeaderboardRankingSystem => false

export const hasRuleset: HasRuleset = <M extends ActiveMode>(
  mode: M,
  ruleset: ActiveRuleset,
): ruleset is AvailableRuleset<M> => false

export { modes, rulesets } from '~/def'

export const features = new Set<Feature>([])
