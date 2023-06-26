import type { ActiveMode } from './common'

export type OP = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
export type ModeOp = 'eq' | 'ne'

export type Tag =
| ['mode', ModeOp, ActiveMode]
| ['bpm' | 'starRating' | 'accuracy' | 'circleSize' | 'approachRate' | 'hpDrain' | 'length', OP, number]
