import type { JSONContent } from '@tiptap/core'
import z, { literal, string, union } from 'zod'
import { assertHasLeaderboardRankingSystem, assertHasRankingSystem, assertHasRuleset } from '../config'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,
} from '~/types/common'

export const zodHandle = string()
export const zodRelationType = union([
  literal('friend'),
  literal('block'),
])

export const zodMode = union([
  literal('osu'),
  literal('taiko'),
  literal('fruits'),
  literal('mania'),
])
export const zodRuleset = union([
  literal('standard'),
  literal('relax'),
  literal('autopilot'),
])
export const zodPPRankingSystem = union([
  literal('ppv2'),
  literal('ppv1'),
])
export const zodScoreRankingSystem = union([
  literal('rankedScore'),
  literal('totalScore'),
])
export const zodLeaderboardRankingSystem = union([
  zodPPRankingSystem,
  zodScoreRankingSystem,
])
export const zodRankingSystem = union([
  zodPPRankingSystem,
  literal('score'),
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
// TODO transform
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
  .record(string(), z.any())
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

export const zodRankingStatus = union([
  literal('graveyard'),
  literal('WIP'),
  literal('pending'),
  literal('ranked'),
  literal('approved'),
  literal('qualified'),
  literal('loved'),
  // literal('deleted'),
  // literal('notFound'),
])
