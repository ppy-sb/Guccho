import {
  BeatmapSource,
  BeatmapWithMeta,
  NormalBeatmapWithMeta,
  RankingStatus,
} from '~/types/beatmap'

export function beatmapIsVisible<T extends RankingStatus>(
  beatmap: BeatmapWithMeta<BeatmapSource, T, any, any>
): beatmap is NormalBeatmapWithMeta<
  BeatmapSource,
  Exclude<T, RankingStatus.NotFound | RankingStatus.Deleted>,
  any,
  any
> {
  if (beatmap.status === RankingStatus.NotFound || beatmap.status === RankingStatus.Deleted) {
    return false
  }
  return true
}
