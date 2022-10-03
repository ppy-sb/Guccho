
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

export type APIfy<T extends Record<string, unknown>, Keys extends keyof T | '_noProp' = '_noProp'> =
  {
    [K in keyof T as
      Keys extends '_noProp'
      ? K | `fetch${Capitalize<string & K>}`
      : K extends Keys
          ? `fetch${Capitalize<string & K>}`
          : K
    ]:
      Keys extends '_noProp'
      ? (() => Awaitable<T[Uncapitalize<string & K>]>) | T[Uncapitalize<string & K>]
      : K extends Keys
          ? () => Awaitable<T[Uncapitalize<string & K>]>
          : T[K]
  }

type Modal = {
  id: string,
  name: string,
  preferences: Record<string, any>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const api: Partial<APIfy<Modal>> = {
  id: '11',
  fetchId () {
    return '11'
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const strictAPI: APIfy<Modal, 'preferences'> = {
  id: '11',
  name: 'test',
  fetchPreferences () {
    return {}
  }
}
