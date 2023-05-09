import type {
  Map as DBMap,
  Score as DBScore,
  Source,
} from '.prisma/bancho.py'
import { BanchoMode, BanchoPyMode, BanchoPyRankedStatus } from '../enums'
import type { Id } from '..'
import { RankingStatusEnum } from '~/types/beatmap'
import { stableMod } from '~/types/score'

import type { BeatmapEssential, Beatmapset, RankingStatus } from '~/types/beatmap'

import type { Mode, Ruleset } from '~/types/common'
import type { StableMod } from '~/types/score'

// this does not deserves exporting
export function toBeatmapset(beatmapset: Source, beatmap: DBMap) {
  const isBancho = beatmapset.server === 'bancho'
  const rest = {
    id: beatmap.setId,
    foreignId: beatmapset.id || beatmap.setId,
    source: beatmapset.server || 'unknown',
    meta: {
      intl: {
        artist: beatmap.artist,
        title: beatmap.title,
      },
    },
    assets: {},
  } as Beatmapset<typeof beatmapset['server'], typeof beatmapset['id'], typeof beatmapset['id']>
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
    mode: BanchoMode[beatmap.mode] as Mode,
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
  const status = toRankingStatus(beatmap.status) || 'WIP'
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

export function toBanchoPyMode(
  mode: Mode,
  ruleset: Ruleset
): BanchoPyMode | undefined {
  const joined: `${Mode}${Capitalize<Ruleset>}` = `${mode}${capitalizeFirstLetter(
    ruleset
  )}`
  switch (joined) {
    case 'maniaRelax':
    case 'taikoAutopilot':
    case 'fruitsAutopilot':
    case 'maniaAutopilot':
      return
    default:
      return BanchoPyMode[joined]
  }
}

const reverseBPyMode = {
  [BanchoPyMode.osuStandard]: ['osu', 'standard'],
  [BanchoPyMode.taikoStandard]: ['taiko', 'standard'],
  [BanchoPyMode.fruitsStandard]: ['fruits', 'standard'],
  [BanchoPyMode.maniaStandard]: ['mania', 'standard'],
  [BanchoPyMode.osuRelax]: ['osu', 'relax'],
  [BanchoPyMode.taikoRelax]: ['taiko', 'relax'],
  [BanchoPyMode.fruitsRelax]: ['fruits', 'relax'],
  [BanchoPyMode.osuAutopilot]: ['osu', 'autopilot'],
} as const

export function fromBanchoPyMode<BMode extends BanchoPyMode>(input: BMode) {
  return reverseBPyMode[input]
}

export function assertIsBanchoPyMode(val: number): asserts val is BanchoPyMode {
  if (!(val in BanchoMode)) {
    throw new Error('unknown bancho.py mode')
  }
}

export function toBanchoRankingStatus(
  input: BanchoPyRankedStatus
): RankingStatusEnum {
  switch (input) {
    case BanchoPyRankedStatus.NotSubmitted:
      return RankingStatusEnum.deleted
    case BanchoPyRankedStatus.Pending:
      return RankingStatusEnum.pending
    case BanchoPyRankedStatus.UpdateAvailable:
      return RankingStatusEnum.notFound
    case BanchoPyRankedStatus.Ranked:
      return RankingStatusEnum.ranked
    case BanchoPyRankedStatus.Approved:
      return RankingStatusEnum.approved
    case BanchoPyRankedStatus.Qualified:
      return RankingStatusEnum.qualified
    case BanchoPyRankedStatus.Loved:
      return RankingStatusEnum.loved
  }
}

export function toMods(e: number): Array<StableMod> {
  const returnValue: Array<StableMod> = []
  if (e === 0) {
    return returnValue
  }

  for (const [mod, bit] of Object.entries(stableMod)) {
    if (bit & e) {
      returnValue.push(mod as StableMod)
    }
  }
  return returnValue
}

export function toRankingStatus(status: BanchoPyRankedStatus) {
  return RankingStatusEnum[toBanchoRankingStatus(status)] as
    | RankingStatus
    | undefined
}
export function fromRankingStatus(status: RankingStatusEnum) {
  switch (status) {
    case RankingStatusEnum.deleted:
    case RankingStatusEnum.notFound:
      return BanchoPyRankedStatus.NotSubmitted
    case RankingStatusEnum.pending:
      return BanchoPyRankedStatus.Pending
    case RankingStatusEnum.ranked:
      return BanchoPyRankedStatus.Ranked
    case RankingStatusEnum.approved:
      return BanchoPyRankedStatus.Approved
    case RankingStatusEnum.qualified:
      return BanchoPyRankedStatus.Qualified
    case RankingStatusEnum.loved:
      return BanchoPyRankedStatus.Loved
    case RankingStatusEnum.WIP:
      return BanchoPyRankedStatus.Pending
    case RankingStatusEnum.graveyard:
      return BanchoPyRankedStatus.Pending
    default:
      throw new Error(`unknown ranking status: ${status}`)
  }
}
