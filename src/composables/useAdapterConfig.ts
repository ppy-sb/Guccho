import {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  leaderboardRankingSystems as supportedLeaderboardRankingSystems,
  modes as supportedModes,
  rankingSystems as supportedRankingSystems,
  rulesets as supportedRulesets,
} from '~/server/trpc/config'

import { settings } from '$active/dynamic-settings'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    supportedRankingSystems,
    supportedLeaderboardRankingSystems,
    settings,
    hasRuleset,
    hasLeaderboardRankingSystem,
    hasRankingSystem,
  }
}
