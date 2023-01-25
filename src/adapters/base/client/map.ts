import type { BeatmapEssential, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus } from '~/types/beatmap'

import type { Awaitable } from '~/types/common'

export namespace MapDataProvider {
  export interface IdQuery<Id> {
    id: Id
  }
}
export interface MapDataProvider<Id> {
  getBeatmapset(query: MapDataProvider.IdQuery<Id>): Awaitable<Beatmapset<BeatmapSource, Id, unknown> & { beatmaps: BeatmapEssential<Id, unknown>[] } | null>
  getBeatmap(query: MapDataProvider.IdQuery<Id>): Awaitable<BeatmapWithMeta<BeatmapSource, RankingStatus, Id, unknown> | null>
  searchBeatmap(opt: { keyword: string }): Awaitable<(BeatmapEssential<Id, unknown> & {
    beatmapset: Beatmapset<BeatmapSource, Id, unknown>
  })[]>
  searchBeatmapset(opt: { keyword: string }): Awaitable<Beatmapset<BeatmapSource, Id, unknown>[]>
}
