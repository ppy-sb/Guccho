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

export interface haveLocalId<LocalId> {
  id: LocalId
}
export interface haveForeignId<ForeignId> {
  foreignId: ForeignId
}

export interface BaseBeatmapset<LocalId> extends haveLocalId<LocalId> {
  source: BeatmapSource
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
  assets: {
    cover?: string
    'cover@2x'?: string
    list?: string
    'list@2x'?: string
  }
}
export interface LocalBeatmapset<LocalId> extends BaseBeatmapset<LocalId> {
  source: Local
}

export interface ReferencedBeatmapset<LocalId, ForeignId> extends BaseBeatmapset<LocalId> {
  source: Foreign
  foreignId: ForeignId
}

export type Beatmapset<LocalId, ForeignId> =
  | ReferencedBeatmapset<LocalId, ForeignId>
  | LocalBeatmapset<LocalId>

export interface BaseBeatmapCompact {
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
export interface LocalBeatmapCompact<Id> extends haveLocalId<Id>, BaseBeatmapCompact {
  source: Local
}
export interface ReferencedBeatmapCompact<Id, ForeignId> extends BaseBeatmapCompact, haveLocalId<Id>, haveForeignId<ForeignId> {
  source: Foreign
}
export type BeatmapCompact<Id, ForeignId> =
| LocalBeatmapCompact<Id>
| ReferencedBeatmapCompact<Id, ForeignId>

export type BeatmapWithMeta<
  Status extends RankingStatus,
  LocalId,
  ForeignId,
> =
  | {
    status: AbnormalStatus
  }
  | NormalBeatmapWithMeta<Exclude<Status, AbnormalStatus>, LocalId, ForeignId>

export type NormalBeatmapWithMeta<
  Status extends Exclude<RankingStatus, AbnormalStatus>,
  LocalId,
  ForeignId,
> =
  | (ReferencedBeatmapCompact<LocalId, ForeignId> & {
    beatmapset: ReferencedBeatmapset<LocalId, ForeignId>
    source: Foreign
    status: Status
  })
  | (LocalBeatmapCompact<LocalId> & {
    beatmapset: LocalBeatmapset<LocalId>
    source: Local | Unknown
    status: Status
  })
