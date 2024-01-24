import {
  type BeatmapWithMeta,
  type NormalBeatmapWithMeta,
  RankingStatus,
} from '~/def/beatmap'

export function beatmapIsVisible<T extends RankingStatus, K extends BeatmapWithMeta<T, any, any>>(
  beatmap: K,
): beatmap is K & NormalBeatmapWithMeta<
  Exclude<T, RankingStatus.NotFound | RankingStatus.Deleted>,
  any,
  any
> {
  if (beatmap.status === RankingStatus.NotFound || beatmap.status === RankingStatus.Deleted) {
    return false
  }
  return true
}
