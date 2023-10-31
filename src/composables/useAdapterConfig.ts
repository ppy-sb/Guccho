import { settings } from '$active/dynamic-settings'
import {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  leaderboardRankingSystems as supportedLeaderboardRankingSystems,
  modes as supportedModes,
  rankingSystems as supportedRankingSystems,
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
  }
}
