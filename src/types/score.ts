import type { Beatmap, BeatmapSource, RankingStatus } from './beatmap'
import type { PPRankingSystem, Range, RankingSystem, Mode as _Mode, Ruleset as _Ruleset } from './common'

type HitCount<T extends _Mode> = Record<
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

export interface ScoreEssential<
  ScoreId,
  Mode extends _Mode,
> {
  id: ScoreId
  playedAt: Date
  mods: Mode extends 'mania' ? ManiaMod[] : Mod[]
  score: bigint
  accuracy: number
  maxCombo: number
  hit: HitCount<Mode>
}

export type RulesetScore<
  ScoreId,
  BeatmapId,
  Mode extends _Mode,
  Ruleset extends _Ruleset,
  Rank extends RankingSystem = never,
  BMSrc extends BeatmapSource = BeatmapSource,
  Status extends RankingStatus = RankingStatus,
> = ScoreEssential<ScoreId, Mode> & {
  mode: Mode
  ruleset: Ruleset
  beatmap: Beatmap<BMSrc, Status, BeatmapId, unknown>
  scoreRank?: number
} & Record<PPRankingSystem & Rank, {
  rank?: number
  pp: number
}>

export interface RankingSystemScore<
  ScoreId,
  BeatmapId,
  Mode extends _Mode,
  Rank extends RankingSystem = never,
  BMSrc extends BeatmapSource = BeatmapSource,
  BMStatus extends RankingStatus = RankingStatus,
> extends ScoreEssential<ScoreId, Mode> {
  pp: Rank extends PPRankingSystem ? number : never
  rank?: number
  beatmap: Beatmap<BMSrc, BMStatus, BeatmapId, unknown>
}
