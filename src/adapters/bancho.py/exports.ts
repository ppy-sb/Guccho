import type { Feature } from '~/types/common'
import { modes, rulesets } from '~/types/common'

export type Id = number
export type ScoreId = bigint

export const features: Set<Feature> = new Set(['userpage'])

export const modes = modes
export const rulesets = rulesets

export * from '~/adapters/bancho.py/transforms/id-conversion'
export * from './checks'
