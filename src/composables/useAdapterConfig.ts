import { supportedOverallLeaderboardRankingSystems, supportedModes, supportedRulesets } from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    supportedOverallLeaderboardRankingSystems,
  }
}
