import { settings } from '$active/dynamic-settings'
import {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  features as supportedFeatures,
  leaderboardRankingSystems as supportedLeaderboardRankingSystems,
  modes as supportedModes,
  rankingSystems as supportedRankingSystems,
  userRoles as supportedRoles,
  rulesets as supportedRulesets,
} from '~/server/trpc/config'

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
    supportedRoles,
    supportedFeatures,
  }
}
