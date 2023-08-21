import type { ActiveMode } from './common'

export enum BeatmapSource {
  Unknown = -1,
  Local,
  Bancho,
  PrivateServer,
}
export type Unknown = BeatmapSource.Unknown
export type Local = BeatmapSource.Local
export type Foreign = BeatmapSource.Bancho | BeatmapSource.PrivateServer

// https://osu.ppy.sh/docs/index.html#beatmapsetcompact-rank-status
export enum RankingStatus {
  Graveyard = -2,
  WIP = -1,
  Pending = 0,
  Ranked = 1,
  Approved = 2,
  Qualified = 3,
  Loved = 4,

  Deleted = 'deleted',
  NotFound = 'notFound', // should not be saved in db
  Unknown = 'unknown',
}

export type AbnormalStatus =
  | RankingStatus.Deleted
  | RankingStatus.NotFound

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
  foreignId: Source extends Foreign ? ForeignId : never
  assets: {
    cover?: string
    'cover@2x'?: string
    list?: string
    'list@2x'?: string
  }
}
export interface BeatmapCompact<Id, ForeignId = never> {
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
  mode: ActiveMode
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
> = BeatmapCompact<
  LocalId,
  Source extends Unknown ? never : ForeignId
> & {
  status: Exclude<Status, AbnormalStatus>
  source?: Source
  beatmapset: Beatmapset<Source, LocalId, ForeignId>
}
