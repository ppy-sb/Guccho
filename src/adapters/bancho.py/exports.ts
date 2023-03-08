import type { Feature } from '~/types/common'
export * from '~/adapters/bancho.py/transforms'
export { modes, rulesets } from '~/types/defs'
export * from './checks'

export type Id = number
export type ScoreId = bigint

export const features: Set<Feature> = new Set(['userpage'])
