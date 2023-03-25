import type { idTransformable } from './extends'
import type {
  BeatmapEssential, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus,
} from '~/types/beatmap'

import type { Awaitable } from '~/types/common'

export namespace MapProvider {
  export interface IdQuery<Id> {
    id: Id
  }
}
export interface MapProvider<Id> extends idTransformable {
  getBeatmapset(query: MapProvider.IdQuery<Id>): Awaitable<
    | (Beatmapset<BeatmapSource, Id, unknown> & {
      beatmaps: BeatmapEssential<Id, unknown>[]
    })
  >
  getBeatmap(
    query: MapProvider.IdQuery<Id>
  ): Awaitable<BeatmapWithMeta<
    BeatmapSource,
    RankingStatus,
    Id,
    unknown
  >>
  searchBeatmap(opt: { keyword: string }): Awaitable<
    (BeatmapEssential<Id, unknown> & {
      beatmapset: Beatmapset<BeatmapSource, Id, unknown>
    })[]
  >
  searchBeatmapset(opt: {
    keyword: string
  }): Awaitable<Beatmapset<BeatmapSource, Id, unknown>[]>

}
