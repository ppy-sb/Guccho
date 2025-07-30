import { features as bF } from '../bancho.py'
import type { Feature } from '~/def/features'

export {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  modes,
  rulesets,
  rankingSystems,
  leaderboardRankingSystems,
  userRoles,
} from '../bancho.py'

export type {
  Id,
  ScoreId,
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  AvailableRankingSystem,
  RankingSystemDef,
  PPRankingSystem,
  ScoreRankingSystem,
  RankingSystem,
  LeaderboardPPRankingSystem,
  LeaderboardScoreRankingSystem,
  LeaderboardRankingSystem,
} from '../bancho.py'

export const features = new Set<Feature>([...bF])
