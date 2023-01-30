import type { JSONContent } from '@tiptap/core'
import z from 'zod'
import { assertHasLeaderboardRankingSystem, assertHasRankingSystem, assertHasRuleset } from '../config'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,
} from './../../../types/common'

export const zodHandle = z.string()
export const zodRelationType = z.union([
  z.literal('friend'),
  z.literal('block'),
])

export const zodMode = z.union([
  z.literal('osu'),
  z.literal('taiko'),
  z.literal('fruits'),
  z.literal('mania'),
])
export const zodRuleset = z.union([
  z.literal('standard'),
  z.literal('relax'),
  z.literal('autopilot'),
])
export const zodPPRankingSystem = z.union([
  z.literal('ppv2'),
  z.literal('ppv1'),
])
export const zodScoreRankingSystem = z.union([
  z.literal('rankedScore'),
  z.literal('totalScore'),
])
export const zodLeaderboardRankingSystem = z.union([
  zodPPRankingSystem,
  zodScoreRankingSystem,
])
export const zodRankingSystem = z.union([
  zodPPRankingSystem,
  z.literal('score'),
])

export const zodSafeModeRulesetBase = z.object({
  mode: zodMode,
  ruleset: zodRuleset,
})

export const validateModeRuleset = ({
  mode,
  ruleset,
}: {
  mode: Mode
  ruleset: Ruleset
}) => {
  return assertHasRuleset(mode, ruleset)
}
// export const zodSafeModeRuleset
//   = zodSafeModeRulesetBase.refine(validateModeRuleset)

export const validateModeRulesetLeaderboardRankingSystem = <M extends Mode, R extends AvailableRuleset<M>>(
  mode: M,
  ruleset: R,
  rankingSystem: LeaderboardRankingSystem,
) => {
  return (
    assertHasRuleset(mode, ruleset)
    && assertHasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
  )
}

export const validateModeRulesetRankingSystem = ({
  mode,
  ruleset,
  rankingSystem,
}: { mode: Mode; ruleset: Ruleset; rankingSystem: RankingSystem } & Record<
  string,
  any
>) => {
  return (
    assertHasRuleset(mode, ruleset)
    && assertHasRankingSystem(mode, ruleset, rankingSystem)
  )
}
// export const zodSafeModeRulesetLeaderboardRankingSystem = zodSafeModeRulesetBase
//   .merge(
//     z.object({
//       rankingSystem: zodLeaderboardRankingSystem,
//     }),
//   )
//   .refine(validateModeRulesetLeaderboardRankingSystem)

export const zodTipTapJSONContent = z
  .record(z.string(), z.any())
  .transform((input, ctx) => {
    if (!('content' in input) || !Array.isArray(input.content)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'has on content',
      })
      return z.NEVER
    }
    return input as JSONContent
  })
