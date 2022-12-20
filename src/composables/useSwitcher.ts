import { forbiddenMode, forbiddenMods } from '../common/varkaUtils'
import useAdapterConfig from './useAdapterConfig'
import type { OverallLeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'

export interface SwitcherPropType {
  mode?: Mode
  ruleset?: Ruleset
  rankingSystem?: OverallLeaderboardRankingSystem
}

export default function useSwitcher(initial?: SwitcherPropType) {
  const { mode, ruleset, rankingSystem } = initial || {}
  const { supportedModes, supportedOverallLeaderboardRankingSystems, supportedRulesets } = useAdapterConfig()
  const data = reactive({
    mode: mode || supportedModes[0],
    ruleset: ruleset || supportedRulesets[0],
    rankingSystem: rankingSystem || supportedOverallLeaderboardRankingSystems[0],
  })
  return [
    data,
    function setSwitcher({ mode, ruleset, rankingSystem }: SwitcherPropType) {
      if (mode && supportedModes.includes(mode) && !forbiddenMode(ruleset || data.ruleset, mode))
        data.mode = mode
      if (ruleset && supportedRulesets.includes(ruleset) && !forbiddenMods(mode || data.mode, ruleset))
        data.ruleset = ruleset
      if (rankingSystem && supportedOverallLeaderboardRankingSystems.includes(rankingSystem))
        data.rankingSystem = rankingSystem
    },
  ] as const
}
export type SwitcherComposableType = ReturnType<typeof useSwitcher>
