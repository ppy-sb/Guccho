import type { Map as DBMap, Source } from '@prisma/client'
import type { AbleToTransformToScores } from './index'
import { toRankingStatus } from './index'
import type { Beatmap, BeatmapSet } from '~/types/beatmap'

// this do not deserves exporting
function toBeatmapSet(beatmapset: Source, beatmap: AbleToTransformToScores['beatmap']): undefined | BeatmapSet<typeof beatmapset['server'], typeof beatmapset['id'], typeof beatmapset['id']> {
  if (!beatmap)
    return
  return {
    id: beatmap.setId,
    foreignId: beatmapset.id,
    source: beatmapset.server === 'privateServer' ? 'privateServer' : 'bancho',
    meta: {
      intl: {
        artist: beatmap.artist,
        title: beatmap.title,
      },
    },
  }
}
export function toBeatmap(beatmap: DBMap & {
  source: Source
}): Beatmap<
  typeof beatmap['source']['server'], typeof status, typeof beatmap['id'], typeof beatmap['id']
> | undefined {
  const beatmapset = toBeatmapSet(beatmap.source, beatmap)
  if (!beatmapset)
    return
  const status = toRankingStatus(beatmap.status) || 'notFound'
  return {
    id: beatmap.id,
    foreignId: beatmap.id,
    status,
    version: beatmap.version,
    md5: beatmap.md5,
    properties: {
      bpm: beatmap.bpm,
      circleSize: beatmap.cs,
      approachRate: beatmap.ar,
      accuracy: beatmap.od,
      hpDrain: beatmap.hp,
      // TODO: count data not available?
      count: {
        circles: 0,
        sliders: 0,
        spinners: 0,
      },
    },
    beatmapset,
  }
}
