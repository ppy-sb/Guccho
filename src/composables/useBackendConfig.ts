import { serverModeConfig, serverRankingSystemConfig, serverRulesetConfig } from '~/server/trpc/config'

export default () => {
  return {
    mode: serverModeConfig,
    ruleset: serverRulesetConfig,
    rankingSystem: serverRankingSystemConfig,
  }
}
