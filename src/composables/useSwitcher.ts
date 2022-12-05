import { forbiddenMode, forbiddenMods } from '../common/varkaUtils'
import type { Mode, RankingSystem, Ruleset } from './../types/common'
import useAdapterConfig from './useAdapterConfig'

export interface SwitcherPropType {
  mode?: Mode
  ruleset?: Ruleset
  rankingSystem?: RankingSystem
}

export default function useSwitcher(initial?: SwitcherPropType) {
  const { mode, ruleset, rankingSystem } = initial || {}
  const { supportedModes, supportedRankingSystems, supportedRulesets } = useAdapterConfig()
  const data = reactive({
    mode: mode || supportedModes[0],
    ruleset: ruleset || supportedRulesets[0],
    rankingSystem: rankingSystem || supportedRankingSystems[0],
  })
  return [
    data,
    function setSwitcher({ mode, ruleset, rankingSystem }: SwitcherPropType) {
      if (mode && supportedModes.includes(mode) && !forbiddenMode(ruleset || data.ruleset, mode))
        data.mode = mode
      if (ruleset && supportedRulesets.includes(ruleset) && !forbiddenMods(mode || data.mode, ruleset))
        data.ruleset = ruleset
      if (rankingSystem && supportedRankingSystems.includes(rankingSystem))
        data.rankingSystem = rankingSystem
    },
  ] as const
}
export type SwitcherComposableType = ReturnType<typeof useSwitcher>
