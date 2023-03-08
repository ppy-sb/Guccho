import type {
  Map as DBMap,
  Score as DBScore,
  Source,
} from '.prisma/bancho.py'
import { BanchoPyMode, BanchoPyRankedStatus } from '../enums'
import type { Id } from '..'
import { RankingStatusEnum } from '~/types/beatmap'
import { stableMod } from '~/types/score'
import { capitalizeFirstLetter } from '~/utils'

import type { BeatmapEssential, Beatmapset, RankingStatus } from '~/types/beatmap'

import type { Mode, Ruleset } from '~/types/common'
import type { StableMod } from '~/types/score'

// this do not deserves exporting
export function toBeatmapset(
  beatmapset: Source,
  beatmap: DBMap,
):
  | undefined
  | Beatmapset<
      (typeof beatmapset)['server'],
      (typeof beatmapset)['id'],
      (typeof beatmapset)['id']
    > {
  return {
    id: beatmap.setId,
    foreignId: beatmapset.id || beatmap.setId,
    source: beatmapset.server || 'unknown',
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

export function toBeatmapWithBeatmapset(
  beatmap: DBMap & {
    source: Source
  },
) {
  const status = toRankingStatus(beatmap.status) || 'WIP'
  const beatmapset = toBeatmapset(beatmap.source, beatmap)
  if (!beatmapset) {
    return
  }
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
  ruleset: Ruleset,
): BanchoPyMode | undefined {
  const joined: `${Mode}${Capitalize<Ruleset>}` = `${mode}${capitalizeFirstLetter(
    ruleset,
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

const reverseRuleset: Record<number, Ruleset> = {
  0: 'standard',
  1: 'relax',
  2: 'autopilot',
}
const reverseMode: Record<number, Mode> = {
  0: 'osu',
  1: 'taiko',
  2: 'fruits',
  3: 'mania',
}

export function fromBanchoPyMode(input: BanchoPyMode): [Mode, Ruleset] {
  const modeKey = input % 4
  const rulesetKet = Math.floor(input / 4)

  return [reverseMode[modeKey], reverseRuleset[rulesetKet]]
}

export function toBanchoRankingStatus(
  input: BanchoPyRankedStatus,
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