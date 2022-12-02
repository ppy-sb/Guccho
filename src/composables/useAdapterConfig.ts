import { supportedModes, supportedRankingSystems, supportedRulesets } from '~/server/trpc/config'

export default () => {
  return {
    supportedModes,
    supportedRulesets,
    supportedRankingSystems,
  }
}
