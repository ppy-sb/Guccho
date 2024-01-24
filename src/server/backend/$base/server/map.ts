import { IdTransformable } from './@extends'
import type { Tag } from '~/def/search'
import type { BeatmapWithMeta, Beatmapset, LocalBeatmapCompact, LocalBeatmapset, RankingStatus, ReferencedBeatmapCompact, ReferencedBeatmapset } from '~/def/beatmap'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }

  export type BeatmapsetWithMaps<Id, ForiengId> =
  | (
    ReferencedBeatmapset<Id, ForiengId> &
    {
      beatmaps: Array<ReferencedBeatmapCompact<Id, ForiengId> & { status: RankingStatus }>
      status: RankingStatus
    }
  )
  | (
    LocalBeatmapset<Id> &
    {
      beatmaps: Array<LocalBeatmapCompact<Id> & { status: RankingStatus }>
      status: RankingStatus
    }
  )

  export type BeatmapWithBeamapset<Id, ForeignId> =
  | ReferencedBeatmapCompact<Id, ForeignId> & { beatmapset: ReferencedBeatmapset<Id, ForeignId> }
  | LocalBeatmapCompact<Id> & { beatmapset: LocalBeatmapset<Id> }
}
export abstract class MapProvider<Id, ForeignId> extends IdTransformable {
  abstract getBeatmapset(query: MapProvider.IdQuery<Id>): PromiseLike<MapProvider.BeatmapsetWithMaps<Id, ForeignId>>
  abstract getBeatmap(
    query: string
  ): PromiseLike<BeatmapWithMeta<
    RankingStatus,
    Id,
    unknown
  >>
  abstract searchBeatmap(opt: { keyword: string; limit: number; filters?: Tag[] }): PromiseLike<
   MapProvider.BeatmapWithBeamapset<Id, ForeignId>[]
  >
  abstract searchBeatmapset(opt: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): PromiseLike<Beatmapset<Id, unknown>[]>
}
