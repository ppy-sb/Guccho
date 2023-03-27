import type { Mode } from './common'

export type OP = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'

export type Tag =
| readonly ['mode', 'eq' | 'ne', Mode]
| readonly ['bpm' | 'starRating' | 'accuracy' | 'circleSize' | 'approachRate' | 'hpDrain' | 'length', OP, number]
