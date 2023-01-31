import type { Feature } from '~/types/common'
export { modes, rulesets } from '~/types/defs'

export type Id = number
export type ScoreId = bigint

export const features: Set<Feature> = new Set(['userpage'])

export * from '~/adapters/bancho.py/transforms/id-conversion'
export * from './checks'
