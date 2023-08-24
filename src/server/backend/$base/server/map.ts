import type { IdTransformable } from './@extends'
import type { Tag } from '~/def/search'
import type {
  BeatmapCompact, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus,
} from '~/def/beatmap'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }
}
export interface MapProvider<Id> extends IdTransformable {
  getBeatmapset(query: MapProvider.IdQuery<Id>): PromiseLike<
    Beatmapset<BeatmapSource, Id, unknown> & {
      beatmaps: BeatmapCompact<Id, unknown>[]
    }
  >
  getBeatmap(
    query: string
  ): PromiseLike<BeatmapWithMeta<
    BeatmapSource,
    RankingStatus,
    Id,
    unknown
  >>
  searchBeatmap(opt: { keyword: string; limit: number; filters?: Tag[] }): PromiseLike<
    (BeatmapCompact<Id, unknown> & {
      beatmapset: Beatmapset<BeatmapSource, Id, unknown>
    })[]
  >
  searchBeatmapset(opt: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): PromiseLike<Beatmapset<BeatmapSource, Id, unknown>[]>

}
