import {
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  modes as supportedModes,
  rulesets as supportedRulesets,
} from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    hasRuleset,
    hasLeaderboardRankingSystem,
    hasRankingSystem,
  }
}
