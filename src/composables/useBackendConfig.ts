
import { serverRankingSystemConfig, serverModeConfig, serverRulesetConfig } from '~/server/trpc/config'

export default () => {
  return {
    mode: serverModeConfig,
    ruleset: serverRulesetConfig,
    rankingSystem: serverRankingSystemConfig
  }
}
