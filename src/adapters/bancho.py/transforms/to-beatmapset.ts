import type { Map as DBMap, Source } from '@prisma/client'
import { toRankingStatus } from './index'
import type { BeatmapWithMeta, Beatmapset } from '~/types/beatmap'

// this do not deserves exporting
export function toBeatmapset(beatmapset: Source, beatmap: DBMap): undefined | Beatmapset<typeof beatmapset['server'], typeof beatmapset['id'], typeof beatmapset['id']> {
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
export function toBeatmap(beatmap: DBMap) {
  return {
    id: beatmap.id,
    foreignId: beatmap.id,
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
  }
}

export function toBeatmapWithBeatmapset(beatmap: DBMap & {
  source: Source
}): BeatmapWithMeta<
  typeof beatmap['source']['server'], typeof status, typeof beatmap['id'], typeof beatmap['id']
> | undefined {
  const beatmapset = toBeatmapset(beatmap.source, beatmap)
  if (!beatmapset)
    return
  const status = toRankingStatus(beatmap.status) || 'notFound'
  return {
    ...toBeatmap(beatmap),
    status,
    beatmapset,
  }
}
