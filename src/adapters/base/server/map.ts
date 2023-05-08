import type { idTransformable } from './extends'
import type { Tag } from '~/types/search'
import type {
  BeatmapEssential, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus,
} from '~/types/beatmap'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }
}
export interface MapProvider<Id> extends idTransformable {
  getBeatmapset(query: MapProvider.IdQuery<Id>): PromiseLike<
    | (Beatmapset<BeatmapSource, Id, unknown> & {
      beatmaps: BeatmapEssential<Id, unknown>[]
    })
  >
  getBeatmap(
    query: MapProvider.IdQuery<Id>
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
