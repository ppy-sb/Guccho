import type { Feature } from '~/types/common'
import { mode, ruleset } from '~/types/common'

export type Id = number
export type ScoreId = bigint

export const features: Set<Feature> = new Set(['userpage'])

export const modes = mode
export const rulesets = ruleset

export * from '~/adapters/bancho.py/transforms/id-conversion'
export * from './checks'
