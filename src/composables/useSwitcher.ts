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
    assertHasLeaderboardRankingSystem,
    assertHasRuleset,
  } = useAdapterConfig()
  const data = reactive({
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
        && assertHasRuleset(mode, ruleset || data.ruleset)
      ) {
        data.mode = mode
      }

      if (
        ruleset
        && supportedRulesets.includes(ruleset)
        && assertHasRuleset(mode || data.mode, ruleset)
      ) {
        data.ruleset = ruleset
      }

      if (
        rankingSystem
        && assertHasRuleset(data.mode, data.ruleset)
        && assertHasLeaderboardRankingSystem(data.mode, data.ruleset, rankingSystem)
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
    assertHasRankingSystem,
    assertHasRuleset,
  } = useAdapterConfig()
  const data = reactive({
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
        && assertHasRuleset(mode, ruleset || data.ruleset)
      ) {
        data.mode = mode
      }
      if (
        ruleset
        && supportedRulesets.includes(ruleset)
        && assertHasRuleset(mode || data.mode, ruleset)
      ) {
        data.ruleset = ruleset
      }
      if (
        rankingSystem
        && assertHasRuleset(data.mode, data.ruleset)
        && assertHasRankingSystem(data.mode, data.ruleset, rankingSystem)
      ) {
        data.rankingSystem = rankingSystem
      }
    },
  ] as const
}
export type SwitcherComposableType = ReturnType<typeof useSwitcher>
