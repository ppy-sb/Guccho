import { Feature } from '~/def/features'

export { modes, rulesets } from '~/def'

export {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
} from './guards'

export type Id = number
export type ScoreId = bigint

export const features = new Set<Feature>([])
