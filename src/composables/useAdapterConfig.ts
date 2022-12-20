import { supportedModes, supportedOverallLeaderboardRankingSystems, supportedRankingSystems, supportedRulesets } from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    supportedOverallLeaderboardRankingSystems,
    supportedRankingSystems,
  }
}
