import z, { literal, number, string, tuple, union } from 'zod'

import type { JSONContent } from '@tiptap/core'
import { hasRuleset } from '../config'

import type { Mode, Ruleset } from '~/types/common'

export const zodHandle = string()
export const zodRelationType = union([literal('friend'), literal('block')])

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
export const zodPPRankingSystem = union([literal('ppv2'), literal('ppv1')])
export const zodScoreRankingSystem = union([
  literal('rankedScore'),
  literal('totalScore'),
])
export const zodLeaderboardRankingSystem = union([
  zodPPRankingSystem,
  zodScoreRankingSystem,
])
export const zodRankingSystem = union([zodPPRankingSystem, literal('score')])

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
  return hasRuleset(mode, ruleset)
}

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

export const zodSearchBeatmap = union([
  tuple([
    union([
      literal('bpm'),
      literal('starRating'),
      literal('accuracy'),
      literal('circleSize'),
      literal('approachRate'),
      literal('hpDrain'),
      literal('length'),
    ]),
    union([
      literal('ne'),
      literal('eq'),
      literal('lte'),
      literal('lt'),
      literal('gte'),
      literal('gt'),
    ]),
    number(),
  ]),
  tuple([
    literal('mode'),
    union([
      literal('ne'),
      literal('eq'),
    ]),
    zodMode,
  ]),
])
