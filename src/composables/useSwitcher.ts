import useAdapterConfig from './useAdapterConfig'

import type {
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,
} from '~/types/common'

export interface SwitcherPropType<TRS> {
  mode?: Mode
  ruleset?: Ruleset
  rankingSystem?: TRS
}

export function useLeaderboardSwitcher(
  initial?: SwitcherPropType<LeaderboardRankingSystem>,
) {
  const { mode, ruleset, rankingSystem } = initial || {}
  const {
    supportedModes,
    supportedRulesets,
    hasLeaderboardRankingSystem,
    hasRuleset,
  } = useAdapterConfig()
  const data = shallowReactive({
    mode: mode || supportedModes[0],
    ruleset: ruleset || supportedRulesets[0],
    rankingSystem: rankingSystem || 'ppv2',
  })
  return [
    data,
    function setSwitcher({
      mode,
      ruleset,
      rankingSystem,
    }: SwitcherPropType<LeaderboardRankingSystem>) {
      if (
        mode
        && supportedModes.includes(mode)
        && hasRuleset(mode, ruleset || data.ruleset)
      ) {
        data.mode = mode
      }

      if (
        ruleset
        && supportedRulesets.includes(ruleset)
        && hasRuleset(mode || data.mode, ruleset)
      ) {
        data.ruleset = ruleset
      }

      if (
        rankingSystem
        && hasRuleset(data.mode, data.ruleset)
        && hasLeaderboardRankingSystem(data.mode, data.ruleset, rankingSystem)
      ) {
        data.rankingSystem = rankingSystem
      }
      else {
        data.rankingSystem = 'ppv2'
      }
    },
  ] as const
}
export type LeaderboardSwitcherComposableType = ReturnType<
  typeof useLeaderboardSwitcher
>

export function useSwitcher(initial?: SwitcherPropType<RankingSystem>) {
  const { mode, ruleset, rankingSystem } = initial || {}
  const {
    supportedModes,
    supportedRulesets,
    hasRankingSystem,
    hasRuleset,
  } = useAdapterConfig()
  const data = shallowReactive({
    mode: mode || supportedModes[0],
    ruleset: ruleset || supportedRulesets[0],
    rankingSystem: rankingSystem || 'ppv2',
  })
  return [
    data,
    function setSwitcher({
      mode,
      ruleset,
      rankingSystem,
    }: SwitcherPropType<RankingSystem>) {
      if (
        mode
        && supportedModes.includes(mode)
        && hasRuleset(mode, ruleset || data.ruleset)
      ) {
        data.mode = mode
      }
      if (
        ruleset
        && supportedRulesets.includes(ruleset)
        && hasRuleset(mode || data.mode, ruleset)
      ) {
        data.ruleset = ruleset
      }
      if (
        rankingSystem
        && hasRuleset(data.mode, data.ruleset)
        && hasRankingSystem(data.mode, data.ruleset, rankingSystem)
      ) {
        data.rankingSystem = rankingSystem
      }
    },
  ] as const
}
export type SwitcherComposableType = ReturnType<typeof useSwitcher>
