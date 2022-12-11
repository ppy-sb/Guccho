import { supportedModes, supportedGrandLeaderboardRankingSystems, supportedRulesets } from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    supportedGrandLeaderboardRankingSystems,
  }
}
