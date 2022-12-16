import type { BeatmapSource, BeatmapWithMeta, RankingStatus } from './beatmap'
import type { Grade, GrandLeaderboardRankingSystem, Mode, NumberRange, PPRankingSystem, Ruleset } from './common'

export type HitCount<_Mode extends Mode> = Record<
  300 | 100 | 50 | 'miss' | (_Mode extends 'mania' ? 'max' | 200 : 'geki' | 'katu'),
  number
>

export type Mod =
  | 'easy' | 'no-fail' | 'half-time'
  | 'hard-rock' | 'sudden-death' | 'double-time' | 'night-core' | 'hidden' | 'flashlight'
  | /* 'relax' | 'auto-pilot' | */ 'spun-out' | 'auto' | 'cinema'

export type ManiaMod =
  | `${NumberRange<4, 10>}k`
  | 'fade-in' | 'co-op' | 'random'

export interface ScoreEssential<
  ScoreId,
  _Mode extends Mode,
> {
  id: ScoreId
  playedAt: Date
  mods: _Mode extends 'mania' ? ManiaMod[] : Mod[]
  score: bigint
  accuracy: number
  maxCombo: number
  grade: Grade
  hit: HitCount<_Mode>
}

export type RulesetScore<
  ScoreId,
  BeatmapId,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  Rank extends GrandLeaderboardRankingSystem = never,
  BMSrc extends BeatmapSource = BeatmapSource,
  Status extends RankingStatus = RankingStatus,
> = ScoreEssential<ScoreId, _Mode> & {
  mode: _Mode
  ruleset: _Ruleset
  beatmap: BeatmapWithMeta<BMSrc, Status, BeatmapId, unknown>
  scoreRank?: number
} & Record<PPRankingSystem & Rank, {
  rank?: number
  pp: number
}>

export interface RankingSystemScore<
  ScoreId,
  BeatmapId,
  _Mode extends Mode,
  Rank extends GrandLeaderboardRankingSystem = never,
  BMSrc extends BeatmapSource = BeatmapSource,
  BMStatus extends RankingStatus = RankingStatus,
> extends ScoreEssential<ScoreId, _Mode> {
  pp: Rank extends PPRankingSystem ? number : never
  rank?: number
  beatmap: BeatmapWithMeta<BMSrc, BMStatus, BeatmapId, unknown>
}
