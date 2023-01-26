import type { BeatmapSource, BeatmapWithMeta, RankingStatus } from './beatmap'
import type { Grade, LeaderboardRankingSystem, Mode, PPRankingSystem, Ruleset } from './common'

export type HitCount<_Mode extends Mode> = Record<
  300 | 100 | 50 | 'miss' | (_Mode extends 'mania' ? 'max' | 200 : 'geki' | 'katu'),
  number
>

export const stableMod = {
  'NoMod': 0,
  'NoFail': 1 << 0,
  'Easy': 1 << 1,
  'TouchDevice': 1 << 2,
  'Hidden': 1 << 3,
  'HardRock': 1 << 4,
  'SuddenDeath': 1 << 5,
  'DoubleTime': 1 << 6,
  'Relax': 1 << 7,
  'HalfTime': 1 << 8,
  // Only set along with DoubleTime. i.e: NC only gives 576
  'Nightcore': 1 << 9,
  'Flashlight': 1 << 10,
  'Autoplay': 1 << 11,
  'SpunOut': 1 << 12,
  // Relax2 : 8192,
  'Autopilot': 1 << 13,
  // Only set along with SuddenDeath. i.e: PF only gives 16416
  'Perfect': 1 << 14,
  '4K': 1 << 15,
  '5K': 1 << 16,
  '6K': 1 << 17,
  '7K': 1 << 18,
  '8K': 1 << 19,
  'FadeIn': 1 << 20,
  'Random': 1 << 21,
  'Cinema': 1 << 22,
  'Target': 1 << 23,
  '9K': 1 << 24,
  'KeyCoop': 1 << 25,
  'Key1': 1 << 26,
  'Key3': 1 << 27,
  'Key2': 1 << 28,
  'ScoreV2': 1 << 29,
  'LastMod': 1 << 30,
  // KeyMod: Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | KeyCoop,
  // FreeModAllowed: NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Autopilot | SpunOut | KeyMod,
  // ScoreIncreaseMods: Hidden | HardRock | DoubleTime | Flashlight | FadeIn,
} as const

export type StableMod = keyof typeof stableMod

// future(lazer) proof
export type Mod = StableMod

export interface ScoreEssential<
  ScoreId,
  _Mode extends Mode,
> {
  id: ScoreId
  playedAt: Date
  mods: Mod[]
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
  PPRank extends PPRankingSystem = never,
  BMSrc extends BeatmapSource = BeatmapSource,
  Status extends RankingStatus = RankingStatus,
> = ScoreEssential<ScoreId, _Mode> & {
  mode: _Mode
  ruleset: _Ruleset
  beatmap: BeatmapWithMeta<BMSrc, Status, BeatmapId, unknown>
  scoreRank?: number
} & Record<PPRankingSystem & PPRank, {
  rank?: number
  pp: number
}>

export interface RankingSystemScore<
  ScoreId,
  BeatmapId,
  _Mode extends Mode,
  PPRank extends LeaderboardRankingSystem = never,
  BMSrc extends BeatmapSource = BeatmapSource,
  BMStatus extends RankingStatus = RankingStatus,
> extends ScoreEssential<ScoreId, _Mode> {
  pp: PPRank extends PPRankingSystem ? number : never
  rank?: number
  beatmap: BeatmapWithMeta<BMSrc, BMStatus, BeatmapId, unknown>
}
