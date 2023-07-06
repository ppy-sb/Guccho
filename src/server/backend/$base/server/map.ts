import type { idTransformable } from './@extends'
import type { Tag } from '~/def/search'
import type {
  BeatmapEssential, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus,
} from '~/def/beatmap'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }
}
export interface MapProvider<Id> extends idTransformable {
  getBeatmapset(query: MapProvider.IdQuery<Id>): PromiseLike<
    Beatmapset<BeatmapSource, Id, unknown> & {
      beatmaps: BeatmapEssential<Id, unknown>[]
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
    (BeatmapEssential<Id, unknown> & {
      beatmapset: Beatmapset<BeatmapSource, Id, unknown>
    })[]
  >
  searchBeatmapset(opt: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): PromiseLike<Beatmapset<BeatmapSource, Id, unknown>[]>

}
