import { forbiddenMode, forbiddenMods } from '../common/varkaUtils'
import useAdapterConfig from './useAdapterConfig'
import type { Mode, OverallLeaderboardRankingSystem, RankingSystem, Ruleset } from '~/types/common'

export interface SwitcherPropType<TRS> {
  mode?: Mode
  ruleset?: Ruleset
  rankingSystem?: TRS
}

export function useOverallSwitcher(initial?: SwitcherPropType<OverallLeaderboardRankingSystem>) {
  const { mode, ruleset, rankingSystem } = initial || {}
  const { supportedModes, supportedOverallLeaderboardRankingSystems, supportedRulesets } = useAdapterConfig()
  const data = reactive({
    mode: mode || supportedModes[0],
    ruleset: ruleset || supportedRulesets[0],
    rankingSystem: rankingSystem || supportedOverallLeaderboardRankingSystems[0],
  })
  return [
    data,
    function setSwitcher({ mode, ruleset, rankingSystem }: SwitcherPropType<OverallLeaderboardRankingSystem>) {
      if (mode && supportedModes.includes(mode) && !forbiddenMode(ruleset || data.ruleset, mode))
        data.mode = mode
      if (ruleset && supportedRulesets.includes(ruleset) && !forbiddenMods(mode || data.mode, ruleset))
        data.ruleset = ruleset
      if (rankingSystem && supportedOverallLeaderboardRankingSystems.includes(rankingSystem))
        data.rankingSystem = rankingSystem
    },
  ] as const
}
export type OverallSwitcherComposableType = ReturnType<typeof useOverallSwitcher>

export function useSwitcher(initial?: SwitcherPropType<RankingSystem>) {
  const { mode, ruleset, rankingSystem } = initial || {}
  const { supportedModes, supportedRankingSystems, supportedRulesets } = useAdapterConfig()
  const data = reactive({
    mode: mode || supportedModes[0],
    ruleset: ruleset || supportedRulesets[0],
    rankingSystem: rankingSystem || supportedRankingSystems[0],
  })
  return [
    data,
    function setSwitcher({ mode, ruleset, rankingSystem }: SwitcherPropType<RankingSystem>) {
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
