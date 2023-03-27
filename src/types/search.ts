import type { Mode } from './common'

export type OP = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'

export type Tag =
| ['mode', 'eq' | 'ne', Mode]
| ['bpm' | 'starRating' | 'accuracy' | 'circleSize' | 'approachRate' | 'hpDrain' | 'length', OP, number]
