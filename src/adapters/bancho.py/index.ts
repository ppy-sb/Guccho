import type { Feature } from '~/types/common'

export { modes, rulesets } from '~/types/defs'

export {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
} from './guards'

export type Id = number
export type ScoreId = bigint

export const features: Set<Feature> = new Set(['userpage'])
