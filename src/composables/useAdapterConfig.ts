import {
  assertHasOverallRankingSystem,
  assertHasRankingSystem,
  assertHasRuleset,
  modes as supportedModes,
  rulesets as supportedRulesets,
} from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    assertHasRuleset,
    assertHasOverallRankingSystem,
    assertHasRankingSystem,
  }
}
