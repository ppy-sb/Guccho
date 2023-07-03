import {
  BeatmapSource,
  BeatmapWithMeta,
  NormalBeatmapWithMeta,
  RankingStatus,
} from '~/def/beatmap'

export function beatmapIsVisible<T extends RankingStatus, K extends BeatmapWithMeta<BeatmapSource, T, any, any>>(
  beatmap: K
): beatmap is K & NormalBeatmapWithMeta<
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
