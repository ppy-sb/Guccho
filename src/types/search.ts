import type { ActiveMode } from './common'

export type OP = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'

export type Tag =
| ['mode', 'eq' | 'ne', ActiveMode]
| ['bpm' | 'starRating' | 'accuracy' | 'circleSize' | 'approachRate' | 'hpDrain' | 'length', OP, number]
