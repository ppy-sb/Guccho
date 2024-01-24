import type { BeatmapWithMeta, RankingStatus } from './beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
} from './common'
import type { Mode } from '.'

export enum Grade {
  F = 'f',
  D = 'd',
  C = 'c',
  B = 'b',
  A = 'a',
  S = 's',
  SH = 'sh',
  SS = 'ss',
  SSH = 'ssh',
}

export type StandardHitCount = Record<'geki' | 300 | 'katu' | 100 | 50 | 'miss', number>
export type ManiaHitCount = Record<'max' | 300 | 200 | 100 | 50 | 'miss', number>

export enum StableMod {
  'NoMod' = 0,
  'NoFail' = 1 << 0,
  'Easy' = 1 << 1,
  'TouchDevice' = 1 << 2,
  'Hidden' = 1 << 3,
  'HardRock' = 1 << 4,
  'SuddenDeath' = 1 << 5,
  'DoubleTime' = 1 << 6,
  'Relax' = 1 << 7,
  'HalfTime' = 1 << 8,
  // Only set along with DoubleTime. i.e= NC only gives 576
  'Nightcore' = 1 << 9,
  'Flashlight' = 1 << 10,
  'Autoplay' = 1 << 11,
  'SpunOut' = 1 << 12,
  // Relax2 = 8192,
  'Autopilot' = 1 << 13,
  // Only set along with SuddenDeath. i.e= PF only gives 16416
  'Perfect' = 1 << 14,
  '4K' = 1 << 15,
  '5K' = 1 << 16,
  '6K' = 1 << 17,
  '7K' = 1 << 18,
  '8K' = 1 << 19,
  'FadeIn' = 1 << 20,
  'Random' = 1 << 21,
  'Cinema' = 1 << 22,
  'Target' = 1 << 23,
  '9K' = 1 << 24,
  'KeyCoop' = 1 << 25,
  '1K' = 1 << 26,
  '3K' = 1 << 27,
  '2K' = 1 << 28,
  'ScoreV2' = 1 << 29,
  'LastMod' = 1 << 30,
  // KeyMod= Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | KeyCoop,
  // FreeModAllowed= NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Autopilot | SpunOut | KeyMod,
  // ScoreIncreaseMods= Hidden | HardRock | DoubleTime | Flashlight | FadeIn,
}

// future(lazer) proof
export type Mod = StableMod

export interface ScoreCompact<ScoreId, M extends ActiveMode> {
  id: ScoreId
  playedAt: Date
  mods: Mod[]
  score: bigint
  accuracy: number
  maxCombo: number
  grade: Grade
  hit: M extends Mode.Mania ? ManiaHitCount : StandardHitCount
}

export type RulesetScore<
  ScoreId,
  BeatmapId,
  M extends ActiveMode,
  Ruleset extends ActiveRuleset,
  PPRank extends PPRankingSystem = never,
  Status extends RankingStatus = RankingStatus,
> = ScoreCompact<ScoreId, M> & {
  mode: M
  ruleset: Ruleset
  beatmap: BeatmapWithMeta<Status, BeatmapId, unknown>
  scoreRank?: number
} & Record<
    PPRankingSystem & PPRank,
    {
      rank?: number
      pp: number
    }
  >

export interface RankingSystemScore<
  ScoreId,
  Id,
 M extends ActiveMode,
  PPRank extends LeaderboardRankingSystem = never,
  BMStatus extends RankingStatus = RankingStatus,
> extends ScoreCompact<ScoreId, M> {
  pp: PPRank extends PPRankingSystem ? number : never
  rank?: number
  beatmap: BeatmapWithMeta<BMStatus, Id, Id>
}
