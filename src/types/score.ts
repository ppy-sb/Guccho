import type { PPRankingSystem, Range, RankingSystem, Mode as _Mode, Ruleset as _Ruleset } from './common'

type BaseCount<T extends _Mode> = Record<
300 | 100 | 50 | 'miss' | (T extends 'mania' ? 'max' | 200 : 'geki' | 'katu'),
number
>

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
  Rank extends RankingSystem = never,
> = {
  id: Id
  mode: Mode
  ruleset: Ruleset
  mods: Mode extends 'mania' ? ManiaMod[] : Mod[]
  score: bigint
  scoreRank?: number
  count: BaseCount<Mode>
} & Record<PPRankingSystem & Rank, {
  rank?: number
  pp: number
}>
