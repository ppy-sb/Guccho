import z from 'zod'

import { zodIdType } from '$active/shapes'
export { zodIdType } from '$active/shapes'

export const zodHandle = z.union([z.string(), z.number(), zodIdType])
export const zodRelationType = z.union([z.literal('friend'), z.literal('block')])

export const zodMode = z.union([z.literal('osu'), z.literal('taiko'), z.literal('fruits'), z.literal('mania')])
export const zodRuleset = z.union([z.literal('standard'), z.literal('relax'), z.literal('autopilot')])
export const zodPPRankingSystem = z.union([z.literal('ppv2'), z.literal('ppv1')])
export const zodScoreRankingSystem = z.union([z.literal('rankedScore'), z.literal('totalScore')])
export const zodRankingSystem = z.union([zodPPRankingSystem, zodScoreRankingSystem])

export const zodTipTapJSONContent = z.record(z.string(), z.any())
