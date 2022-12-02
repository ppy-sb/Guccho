import type { Enumerate } from './internal-utils'
export const mode = ['osu', 'taiko', 'fruits', 'mania'] as const
export type Mode = typeof mode[number]

export const ruleset = ['standard', 'relax', 'autopilot'] as const
export type Ruleset = typeof ruleset[number]

export const relationship = ['friend', 'block'] as const
export type Relationship = typeof relationship[number]

export const mutualRelationship = ['mutual-friend', 'mutual-block'] as const
export type MutualRelationship = typeof mutualRelationship[number]

export const standardAvailable = mode
export type StandardAvailable = Mode

export const relaxAvailable = ['osu', 'taiko', 'fruits'] as const
export type RelaxAvailable = typeof relaxAvailable[number]

export const autopilotAvailable = ['osu'] as const
export type AutopilotAvailable = typeof autopilotAvailable[number]

export const scoreRankingSystem = ['rankedScore', 'totalScore'] as const
export type ScoreRankingSystem = typeof scoreRankingSystem[number]

export const ppRankingSystem = ['ppv2', 'ppv1'] as const
export type PPRankingSystem = typeof ppRankingSystem[number]

export const rankingSystem = [...ppRankingSystem, ...scoreRankingSystem] as const
export type RankingSystem = typeof rankingSystem[number]

export const scope = ['self', 'friends', 'public'] as const
export type Scope = typeof scope[number]

export const grade = ['f', 'd', 'c', 'b', 'a', 's', 'sh', 'ss', 'ssh'] as const
export type Grade = typeof grade[number]

// utils
// export type OmitNever<T> = {
//   [K in keyof T as T[K] extends never ? never : K]: T[K];
// }
export type Awaitable<T> = T | Promise<T>

// export type APIfy<
//   T extends Record<string, any>,
//   Keys extends keyof T | '_noProp' = '_noProp',
// > = {
//   [K in keyof T as K extends Keys
//     ? `fetch${Capitalize<string & K>}`
//     : Keys extends '_noProp'
//       ? K | `fetch${Capitalize<string & K>}`
//       : K]: K extends Keys ? () => Awaitable<T[Uncapitalize<string & K>]> : T[K];
// }

export type Range<F extends number, T extends number> = Exclude<
Enumerate<T>,
Enumerate<F>
>

export type UserpageShowType = 'tab' | 'dropdown' | 'hidden'
export type ServerConfig<AvailableRankingSystem extends RankingSystem> = Record<AvailableRankingSystem, {
  userpage: {
    show: UserpageShowType
  }
  name: string
}>

export type AutoAvailable<_Ruleset extends Ruleset> = {
  'standard': StandardAvailable
  'relax': RelaxAvailable
  'autopilot': AutopilotAvailable
}[_Ruleset]
