import {
  assertHasOverallRankingSystem,
  assertHasRankingSystem,
  modes as supportedModes,
  rulesets as supportedRulesets,
} from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    assertHasOverallRankingSystem,
    assertHasRankingSystem,
  }
}
