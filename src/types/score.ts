import type { PPRankingSystem, Mode as _Mode, Ruleset as _Ruleset, Range } from './common'

type BaseCount = {
    300: number,
    100: number,
    50: number,
    miss: number,
    geki: number,
    katu: number,
  }
type ModeCount = {
  osu: BaseCount
  taiko: BaseCount
  fruits: BaseCount
  mania: {
    max: number,
    300: number,
    200: number,
    100: number,
    50: number,
    miss: number,
  }
}
export type Mod =
| 'easy' | 'no-fail' | 'half-time'
| 'hard-rock' | 'sudden-death' | 'double-time' | 'night-core' | 'hidden' | 'flashlight'
| /* 'relax' | 'auto-pilot' | */ 'spun-out' | 'auto' | 'cinema'

export type ManiaMod =
| `${Range<4, 10>}k`
| 'fade-in' | 'co-op' | 'random'

export type Score<
  Id,
  Mode extends _Mode,
  Ruleset extends _Ruleset,
  Rank extends PPRankingSystem = never
> = {
  id: Id
  mode: Mode
  ruleset: Ruleset
  mods: Mode extends 'mania' ? ManiaMod[] :Mod[]
  score: bigint
  scoreRank?: number,
  count: ModeCount[Mode]
} & {
  [R in PPRankingSystem as R extends Rank ? R : never]: {
    rank?: number,
    pp: number,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test: Score<string, 'osu', 'standard', 'ppv1' | 'ppv2'> = {
  id: '1',
  mode: 'osu',
  ruleset: 'standard',
  score: 3000n,
  scoreRank: 1,

  mods: ['easy', 'half-time'],
  count: {
    300: 0,
    100: 0,
    50: 0,
    miss: 0,
    geki: 0,
    katu: 0
  },
  ppv1: {
    rank: 0,
    pp: 0
  },
  ppv2: {
    rank: 0,
    pp: 0
  }
}
