import type { Mode } from './common'

export type UnknownSource = 'unknown'
export type LocalSource = 'local'
export type ForeignSource = 'bancho' | 'privateServer'
export type BeatmapSource = LocalSource | ForeignSource | UnknownSource

// https://osu.ppy.sh/docs/index.html#beatmapsetcompact-rank-status
export enum RankingStatusEnum {
  graveyard = -2,
  WIP = -1,
  pending = 0,
  ranked = 1,
  approved = 2,
  qualified = 3,
  loved = 4,

  deleted = 'deleted',
  notFound = 'notFound', // should not be saved in db
}

export type RankingStatus = keyof typeof RankingStatusEnum
export type AbnormalStatus =
  | (keyof typeof RankingStatusEnum & 'deleted')
  | 'notFound'

export interface Beatmapset<Source extends BeatmapSource, LocalId, ForeignId> {
  meta: {
    // unicode
    artist?: string
    title?: string

    // (Probably) ASCII Based
    intl: {
      artist: string
      title: string
    }
  }
  id: LocalId
  source: Source
  foreignId: Source extends ForeignSource ? ForeignId : never
  assets: {
    cover?: string
    'cover@2x'?: string
    list?: string
    'list@2x'?: string
  }
}
export interface BeatmapEssential<Id, ForeignId = never> {
  id: Id
  foreignId: ForeignId
  properties: {
    bpm: number
    // CS
    circleSize: number
    // AR
    approachRate: number
    // OD
    accuracy: number
    // HP
    hpDrain: number

    count: {
      circles: number
      sliders: number
      spinners: number
    }
    totalLength: number
    maxCombo: number
    starRate: number
  }
  mode: Mode
  md5: string
  version: string
  creator: string
  lastUpdate: Date
}
export type BeatmapWithMeta<
  Source extends BeatmapSource,
  Status extends RankingStatus,
  LocalId,
  ForeignId,
> =
  | {
    status: Status & AbnormalStatus
  }
  | NormalBeatmapWithMeta<Source, Status, LocalId, ForeignId>

export type NormalBeatmapWithMeta<
  Source extends BeatmapSource,
  Status extends RankingStatus,
  LocalId,
  ForeignId,
> = BeatmapEssential<
  LocalId,
  Source extends UnknownSource ? never : ForeignId
> & {
  status: Exclude<Status, AbnormalStatus>
  source?: Source
  beatmapset: Beatmapset<Source, LocalId, ForeignId>
}
