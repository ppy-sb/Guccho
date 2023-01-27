import type { JSONContent } from '@tiptap/core'
import z from 'zod'

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
export const zodOverallRankingSystem = z.union([
  zodPPRankingSystem,
  zodScoreRankingSystem,
])
export const zodRankingSystem = z.union([
  zodPPRankingSystem,
  z.literal('score'),
])

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
