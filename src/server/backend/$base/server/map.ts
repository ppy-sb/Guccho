import { IdTransformable } from './@extends'
import type { Tag } from '~/def/search'
import type { BeatmapWithMeta, Beatmapset, LocalBeatmapCompact, LocalBeatmapset, RankingStatus, ReferencedBeatmapCompact, ReferencedBeatmapset } from '~/def/beatmap'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }

  export interface Metrics {
    total: number
    ranked: number
    custom: number
  }

  export interface BeatmapRequest {
    status: 'allowed' | 'voted'
    voteCount: number
  }

  interface BeatmapMeta {
    status: RankingStatus
    request?: BeatmapRequest
  }

  export type BeatmapsetWithMaps<Id, ForeignId> =
    | (
      ReferencedBeatmapset<Id, ForeignId> & {
        beatmaps: Array<ReferencedBeatmapCompact<Id, ForeignId> & BeatmapMeta>
      }
    )
    | (
      LocalBeatmapset<Id> & {
        beatmaps: Array<LocalBeatmapCompact<Id> & BeatmapMeta>
      }
    )

  export type BeatmapWithBeamapset<Id, ForeignId> =
    | ReferencedBeatmapCompact<Id, ForeignId> & { beatmapset: ReferencedBeatmapset<Id, ForeignId> }
    | LocalBeatmapCompact<Id> & { beatmapset: LocalBeatmapset<Id> }
}
export abstract class MapProvider<Id, ForeignId> extends IdTransformable {
  abstract getBeatmapset(query: MapProvider.IdQuery<Id>, user?: { id: Id }): Promise<MapProvider.BeatmapsetWithMaps<Id, ForeignId>>
  abstract getBeatmap(
    query: string
  ): Promise<BeatmapWithMeta<
    RankingStatus,
    Id,
    ForeignId
  >>

  abstract metrics(): Promise<MapProvider.Metrics>

  abstract getMapRankRequest(id: Id, user?: { id: Id }): Promise<MapProvider.BeatmapRequest | undefined>
  abstract voteMap(id: Id, user: { id: Id }): Promise<MapProvider.BeatmapRequest | undefined>
  abstract searchBeatmap(opt: { keyword: string; limit: number; filters?: Tag[] }): Promise<
    MapProvider.BeatmapWithBeamapset<Id, ForeignId>[]
  >
  abstract searchBeatmapset(opt: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): Promise<Beatmapset<Id, ForeignId>[]>
}
