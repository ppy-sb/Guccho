
export type Mode = 'osu' | 'taiko' | 'fruits' | 'mania'
export type Ruleset = 'standard' | 'relax' | 'autopilot'

export type StandardAvailable = Mode
export type RelaxAvailable = 'osu' | 'taiko' | 'fruits'
export type AutopilotAvailable = 'osu'

export type ScoreRankingSystem = 'rankedScores' | 'totalScores'
export type PPRankingSystem = 'ppv2' | 'ppv1'
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type VisibilityScope = 'nobody' | 'friends' | 'public'

// utils
export type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }
export type Awaitable<T> = T | Promise<T>

// export type APIfy<T extends Record<string, unknown>, keys extends keyof T = never> =
// {
//   [K in keyof T as K extends keys ? never : K]: T[K]
// } & {
//   [K in keyof T as K extends keys ? `fetch${Capitalize<string & K>}` : never]: () => Awaitable<T[Uncapitalize<string & K>]>
// }

export type APIfy<T extends Record<string, unknown>, keys extends keyof T | '_nobody\'s gonna know' = '_nobody\'s gonna know'> =
  {
    [K in keyof T as

      keys extends '_nobody\'s gonna know'
      ? K | `fetch${Capitalize<string & K>}`

      : K extends keys
          ? `fetch${Capitalize<string & K>}`
          : K
    ]:
      keys extends '_nobody\'s gonna know'
      ? (() => Awaitable<T[Uncapitalize<string & K>]>) | T[Uncapitalize<string & K>]
      : K extends `fetch${Capitalize<string & K>}`
          ? () => Awaitable<T[Uncapitalize<string & K>]>
          : T[K]
  }

// type Modal = {
//   id: string,
//   name: string,
//   preferences: Record<string, any>
// }

// const api: Partial<APIfy<Modal>> = {
//   id: '11',
//   fetchId () {
//     return '11'
//   }
// }

// const strictAPI: APIfy<Modal, 'preferences'> = {
//   id: '11',
//   name: 'test',
//   fetchPreferences () {
//     return {}
//   }
// }
