import type { BeatmapSource, BeatmapWithMeta, NormalBeatmapWithMeta, RankingStatus } from '~/types/beatmap'
export function assertBeatmapIsVisible<T extends RankingStatus>(beatmap: BeatmapWithMeta<BeatmapSource, T, any, any>): beatmap is NormalBeatmapWithMeta<BeatmapSource, Exclude<T, 'notFound' | 'deleted'>, any, any> {
  if (beatmap.status === 'notFound' || beatmap.status === 'deleted')
    return false
  return true
}
