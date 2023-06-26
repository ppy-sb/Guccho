import { existsSync } from 'node:fs'
import { ZodIssueCode, ZodSchema, literal, nativeEnum, number, string, tuple, union, z } from 'zod'

import validator from 'validator'
import { hasRuleset } from '../config'
import { LeaderboardScoreRank, Mode, PPRank, Relationship, Ruleset, ScoreRank } from '~/def'
import type { ArticleProvider } from '$base/server/article'

import type { ActiveMode, ActiveRuleset } from '~/def/common'
import { RankingStatus } from '~/def/beatmap'

export const zodHandle = string().trim()
export const zodRelationType = nativeEnum(Relationship)

export const zodMode = nativeEnum(Mode)
export const zodRuleset = nativeEnum(Ruleset)

export const zodPPRankingSystem = nativeEnum(PPRank)
export const zodScoreRankingSystem = nativeEnum(LeaderboardScoreRank)
export const zodLeaderboardRankingSystem = zodPPRankingSystem.or(zodScoreRankingSystem)
export const zodRankingSystem = zodPPRankingSystem.or(nativeEnum(ScoreRank))

export const zodSafeModeRulesetBase = z.object({
  mode: zodMode,
  ruleset: zodRuleset,
})

export function validateModeRuleset({
  mode,
  ruleset,
}: {
  mode: ActiveMode
  ruleset: ActiveRuleset
}) {
  return hasRuleset(mode, ruleset)
}

export const zodTipTapJSONContent = z
  .record(string(), z.any())
  .superRefine((input, ctx): input is ArticleProvider.JSONContent => {
    if (!('content' in input) || !Array.isArray(input.content)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'has on content',
      })
    }
    return z.NEVER
  }) as unknown as ZodSchema<ArticleProvider.JSONContent>

export const zodRankingStatus = nativeEnum(RankingStatus)

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

export const zodFQDN = string().trim().refine((input) => {
  return validator.isFQDN(input)
})

export const zodPath = string().trim().superRefine((val, ctx) => {
  if (!existsSync(val)) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      message: 'invalid path: Guccho cannot access the path you provided',
    })
  }
})
