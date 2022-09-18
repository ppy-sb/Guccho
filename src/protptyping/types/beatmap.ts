export type UnknownSource = 'unknown'
export type LocalSource = 'local'
export type ForeignSource = 'bancho' | 'private-server'
export type BeatmapSource = LocalSource | ForeignSource | UnknownSource

export enum RankingStatusEnum {
  unsubmitted,
  WIP,
  pending,
  ranked,
  approved,
  loved,
  disqualified,
  unranked
}

export type RankingStatus = keyof typeof RankingStatusEnum

export interface Beatmap<Source extends BeatmapSource, Status extends RankingStatusEnum, LocalId, ForeignId> {
  id: Source extends UnknownSource ?
      Status extends RankingStatusEnum.unsubmitted | RankingStatusEnum.unranked ?
      never :
      LocalId :
      LocalId
  foreignId:
      Source extends ForeignSource ? ForeignId : never

  properties: {
    // CS
    circleSize: number,
    // AR
    approachRate: number,
    // OD
    accuracy: number,
    // HP
    hpDrain: number
  },
  meta: {
    // unicode
    artist?: string,
    title?: string

    // ascii (?)
    intl: {
      artist: string,
      title: string
    }
  }
}
