import { features as bF } from '../bancho.py'
import { Feature } from '~/def/features'

export {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  modes,
  rulesets,
} from '../bancho.py'
export type { Id, ScoreId } from '../bancho.py'

export const features = new Set<Feature>([...bF])
