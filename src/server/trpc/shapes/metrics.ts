import { literal } from 'zod'

export const zodMetricsPeriod = literal('daily').or(literal('weekly')).or(literal('monthly'))
