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
  deleted = 5,

  notFound = 8, // should not be saved in db
}

export type RankingStatus = keyof typeof RankingStatusEnum

export type BeatmapSet<Source extends BeatmapSource, LocalId, ForeignId> =
  {
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
  } & ({
    source: UnknownSource
  } | {
    source: Exclude<Source, UnknownSource>
    id: LocalId

    foreignId: ForeignId
  })

export type Beatmap<
  Source extends BeatmapSource,
  Status extends RankingStatus,
  LocalId,
  ForeignId,
> = Status extends 'notFound' | 'deleted'
  ? {
      status: Status
    }
  : (
      {
        id: LocalId
        status: Status
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
        version: string
        beatmapset: BeatmapSet<Source, LocalId, ForeignId>
      }
      & (Source extends UnknownSource ? {} : { foreignId: ForeignId })
    )
