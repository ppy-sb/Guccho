import type {
  Map as DBMap,
  Score as DBScore,
  Source,
} from 'prisma-client-bancho-py'
import { $enum } from 'ts-enum-util'
import type { Id } from '..'
import { BanchoPyRankedStatus } from '../enums'

import { fromBanchoMode } from '.'
import { BeatmapSource, RankingStatus } from '~/types/beatmap'
import { StableMod } from '~/types/score'

import type { BeatmapEssential, Beatmapset } from '~/types/beatmap'

export function toBeatmapset(beatmapset: Source, luckyOneBeatmapInBeatmapset: DBMap) {
  const isBancho = beatmapset.server === 'bancho'
  const rest: Beatmapset<BeatmapSource.Bancho | BeatmapSource.PrivateServer | BeatmapSource.Unknown, typeof beatmapset['id'], typeof beatmapset['id']> = {
    id: luckyOneBeatmapInBeatmapset.setId,
    foreignId: beatmapset.id || luckyOneBeatmapInBeatmapset.setId,
    source: isBancho ? BeatmapSource.Bancho : beatmapset.server === 'privateServer' ? BeatmapSource.PrivateServer : BeatmapSource.Unknown,
    meta: {
      intl: {
        artist: luckyOneBeatmapInBeatmapset.artist,
        title: luckyOneBeatmapInBeatmapset.title,
      },
    },
    assets: {},
  }
  if (isBancho) {
    const v = Math.floor(new Date().getTime() / 1000)
    rest.assets.cover = `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/cover.jpg?${v}`
    rest.assets['cover@2x'] = `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/cover@2x.jpg?${v}`
    rest.assets.list = `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/list.jpg?${v}`
    rest.assets['list@2x'] = `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/list@2x.jpg?${v}`
  }
  return rest
}

export function toBeatmapEssential(beatmap: {
  id: number
  // setId: number
  // status: number
  md5: string
  // artist: string
  // title: string
  version: string
  creator: string
  // filename: string
  lastUpdate: Date
  totalLength: number
  maxCombo: number
  // frozen: boolean
  plays: number
  passes: number
  mode: number
  bpm: number
  cs: number
  ar: number
  od: number
  hp: number
  diff: number
}): BeatmapEssential<Id, Id> {
  return {
    id: beatmap.id,
    foreignId: beatmap.id,
    version: beatmap.version,
    md5: beatmap.md5,
    creator: beatmap.creator,
    lastUpdate: beatmap.lastUpdate,
    mode: fromBanchoMode(beatmap.mode),
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

export function toBeatmapWithBeatmapset(
  beatmap: DBMap & {
    source: Source
  }
) {
  const status = toRankingStatus(beatmap.status) || RankingStatus.WIP
  const beatmapset = toBeatmapset(beatmap.source, beatmap)
  return Object.assign(toBeatmapEssential(beatmap), {
    status,
    beatmapset,
  })
}

export type AbleToTransformToScores = DBScore & {
  beatmap:
  | (DBMap & {
    source: Source
  })
  | null
}

const rankingStatusMap = {
  [BanchoPyRankedStatus.NotSubmitted]: RankingStatus.Deleted,
  [BanchoPyRankedStatus.Pending]: RankingStatus.Pending,
  [BanchoPyRankedStatus.UpdateAvailable]: RankingStatus.NotFound,
  [BanchoPyRankedStatus.Ranked]: RankingStatus.Ranked,
  [BanchoPyRankedStatus.Approved]: RankingStatus.Approved,
  [BanchoPyRankedStatus.Qualified]: RankingStatus.Qualified,
  [BanchoPyRankedStatus.Loved]: RankingStatus.Loved,
} as const
export function toRankingStatus(input: BanchoPyRankedStatus): RankingStatus {
  return rankingStatusMap[input] ?? RankingStatus.Unknown
}

export function toMods(e: number): Array<StableMod> {
  const returnValue: Array<StableMod> = []
  if (e === 0) {
    return returnValue
  }
  const w = $enum(StableMod)
  for (const bit of w.getValues()) {
    if (bit & e) {
      returnValue.push(bit)
    }
  }
  return returnValue
}

export function fromRankingStatus(status: RankingStatus) {
  switch (status) {
    case RankingStatus.Deleted:
    case RankingStatus.NotFound:
      return BanchoPyRankedStatus.NotSubmitted
    case RankingStatus.Pending:
      return BanchoPyRankedStatus.Pending
    case RankingStatus.Ranked:
      return BanchoPyRankedStatus.Ranked
    case RankingStatus.Approved:
      return BanchoPyRankedStatus.Approved
    case RankingStatus.Qualified:
      return BanchoPyRankedStatus.Qualified
    case RankingStatus.Loved:
      return BanchoPyRankedStatus.Loved
    case RankingStatus.WIP:
      return BanchoPyRankedStatus.Pending
    case RankingStatus.Graveyard:
      return BanchoPyRankedStatus.Pending
    default:
      throw new Error(`unknown ranking status: ${status}`)
  }
}
