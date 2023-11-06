import { IdTransformable } from './@extends'
import type { Tag } from '~/def/search'
import type {
  BeatmapCompact, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus,
} from '~/def/beatmap'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }
}
export abstract class MapProvider<Id> extends IdTransformable {
  abstract getBeatmapset(query: MapProvider.IdQuery<Id>): PromiseLike<
    Beatmapset<BeatmapSource, Id, unknown> & {
      beatmaps: BeatmapCompact<Id, unknown>[]
    }
  >
  abstract getBeatmap(
    query: string
  ): PromiseLike<BeatmapWithMeta<
    BeatmapSource,
    RankingStatus,
    Id,
    unknown
  >>
  abstract searchBeatmap(opt: { keyword: string; limit: number; filters?: Tag[] }): PromiseLike<
    (BeatmapCompact<Id, unknown> & {
      beatmapset: Beatmapset<BeatmapSource, Id, unknown>
    })[]
  >
  abstract searchBeatmapset(opt: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): PromiseLike<Beatmapset<BeatmapSource, Id, unknown>[]>
}
