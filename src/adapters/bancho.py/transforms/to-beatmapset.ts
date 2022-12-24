import type { Map as DBMap, Source } from '@prisma/client' // bancho.py
import type { Id } from '../config'
import { toRankingStatus } from './index'
import type { BeatmapEssential, Beatmapset } from '~/types/beatmap'

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
export function toBeatmapEssential(beatmap: DBMap): BeatmapEssential<Id, Id> {
  return {
    id: beatmap.id,
    foreignId: beatmap.id,
    version: beatmap.version,
    md5: beatmap.md5,
    creator: beatmap.creator,
    lastUpdate: beatmap.lastUpdate,
    properties: {
      bpm: beatmap.bpm,
      circleSize: beatmap.cs,
      approachRate: beatmap.ar,
      accuracy: beatmap.od,
      hpDrain: beatmap.hp,
      totalLength: beatmap.totalLength,
      maxCombo: beatmap.maxCombo,
      starRate: beatmap.diff,
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
}) {
  const status = toRankingStatus(beatmap.status) || 'WIP'
  const beatmapset = toBeatmapset(beatmap.source, beatmap)
  if (!beatmapset)
    return
  return Object.assign(toBeatmapEssential(beatmap), {
    status,
    beatmapset,
  })
}
