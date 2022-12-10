import type { Awaitable } from '~/types/common'
import type { BeatmapEssential, BeatmapSource, BeatmapWithMeta, Beatmapset, RankingStatus } from '~/types/beatmap'

export abstract class MapDataProvider<Id> {
  abstract getBeatmapset(query: { id: Id }): Awaitable<Beatmapset<BeatmapSource, Id, unknown> & { beatmaps: BeatmapEssential<Id, unknown>[] } | null>
  abstract getBeatmap(query: { id: Id }): Awaitable<BeatmapWithMeta<BeatmapSource, RankingStatus, Id, unknown> | null>
}
