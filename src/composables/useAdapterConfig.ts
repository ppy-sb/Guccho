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
    hasRuleset,
    hasLeaderboardRankingSystem,
    hasRankingSystem,
  }
}
