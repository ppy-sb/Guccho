export type UnknownSource = 'unknown'
export type LocalSource = 'local'
export type ForeignSource = 'bancho' | 'private-server'
export type BeatmapSource = LocalSource | ForeignSource | UnknownSource

// https://osu.ppy.sh/docs/index.html#beatmapsetcompact-rank-status
export enum RankingStatusEnum {
  graveyard = -2,
  WIP = -1,
  wip = -1,
  pending,
  ranked,
  approved,
  qualified,
  loved,
  deleted,
}

export type RankingStatus = keyof typeof RankingStatusEnum

export interface Beatmap<
  Source extends BeatmapSource,
  Status extends RankingStatusEnum,
  LocalId,
  ForeignId
> {
  id: Source extends UnknownSource
  ? Status extends RankingStatusEnum.deleted
  ? never
  : LocalId
  : LocalId

  foreignId: Source extends ForeignSource ? ForeignId : never

  setId: Source extends UnknownSource
  ? never
  : LocalId

  foreignSetId: Source extends ForeignSource
  ? ForeignId
  : never

  status: RankingStatus

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
  }
  md5: string
}

export interface BeatmapSet<Source extends BeatmapSource, LocalId, ForeignId> {
  beatmaps: Beatmap<Source, RankingStatusEnum, LocalId, ForeignId>
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
}
