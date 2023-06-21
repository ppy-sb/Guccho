import type {
  Map as DBMap,
  Score as DBScore,
  Source,
} from '.prisma/bancho.py'
import { match } from 'switch-pattern'
import { $enum } from 'ts-enum-util'
import { BanchoMode, BanchoPyMode, BanchoPyRankedStatus, fromBanchoMode } from '../enums'
import type { Id } from '..'
import { Mode, Ruleset } from '~/types/defs'
import { BeatmapSource, RankingStatus } from '~/types/beatmap'
import { StableMod } from '~/types/score'

import type { BeatmapEssential, Beatmapset } from '~/types/beatmap'

import type { ActiveMode, ActiveRuleset } from '~/types/common'

// this does not deserves exporting
export function toBeatmapset(beatmapset: Source, beatmap: DBMap) {
  const isBancho = beatmapset.server === 'bancho'
  const rest: Beatmapset<BeatmapSource.Bancho | BeatmapSource.PrivateServer | BeatmapSource.Unknown, typeof beatmapset['id'], typeof beatmapset['id']> = {
    id: beatmap.setId,
    foreignId: beatmapset.id || beatmap.setId,
    source: beatmapset.server === 'bancho' ? BeatmapSource.Bancho : beatmapset.server === 'privateServer' ? BeatmapSource.PrivateServer : BeatmapSource.Unknown,
    meta: {
      intl: {
        artist: beatmap.artist,
        title: beatmap.title,
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

export function toBanchoPyMode(
  mode: ActiveMode,
  ruleset: ActiveRuleset
): BanchoPyMode | undefined {
  const { patterns, exact } = match([mode, ruleset])

  switch (patterns) {
    case exact([Mode.Osu, Ruleset.Standard]): return BanchoPyMode.OsuStandard
    case exact([Mode.Taiko, Ruleset.Standard]): return BanchoPyMode.TaikoStandard
    case exact([Mode.Fruits, Ruleset.Standard]): return BanchoPyMode.FruitsStandard
    case exact([Mode.Mania, Ruleset.Standard]): return BanchoPyMode.ManiaStandard
    case exact([Mode.Osu, Ruleset.Relax]): return BanchoPyMode.OsuRelax
    case exact([Mode.Taiko, Ruleset.Relax]): return BanchoPyMode.TaikoRelax
    case exact([Mode.Fruits, Ruleset.Relax]): return BanchoPyMode.FruitsRelax
    case exact([Mode.Osu, Ruleset.Autopilot]): return BanchoPyMode.OsuAutopilot
  }
}

const reverseBPyMode = {
  [BanchoPyMode.OsuStandard]: [Mode.Osu, Ruleset.Standard],
  [BanchoPyMode.TaikoStandard]: [Mode.Taiko, Ruleset.Standard],
  [BanchoPyMode.FruitsStandard]: [Mode.Fruits, Ruleset.Standard],
  [BanchoPyMode.ManiaStandard]: [Mode.Mania, Ruleset.Standard],
  [BanchoPyMode.OsuRelax]: [Mode.Osu, Ruleset.Relax],
  [BanchoPyMode.TaikoRelax]: [Mode.Taiko, Ruleset.Relax],
  [BanchoPyMode.FruitsRelax]: [Mode.Fruits, Ruleset.Relax],
  [BanchoPyMode.OsuAutopilot]: [Mode.Osu, Ruleset.Autopilot],
} as const
export function fromBanchoPyMode<BMode extends BanchoPyMode>(input: BMode): readonly [Mode, Ruleset] {
  return reverseBPyMode[input]
}

export function assertIsBanchoPyMode(val: number): asserts val is BanchoPyMode {
  if (!(val in BanchoMode)) {
    throw new Error('unknown bancho.py mode')
  }
}

export function toBanchoRankingStatus(
  input: BanchoPyRankedStatus
): RankingStatus {
  switch (input) {
    case BanchoPyRankedStatus.NotSubmitted:
      return RankingStatus.Deleted
    case BanchoPyRankedStatus.Pending:
      return RankingStatus.Pending
    case BanchoPyRankedStatus.UpdateAvailable:
      return RankingStatus.NotFound
    case BanchoPyRankedStatus.Ranked:
      return RankingStatus.Ranked
    case BanchoPyRankedStatus.Approved:
      return RankingStatus.Approved
    case BanchoPyRankedStatus.Qualified:
      return RankingStatus.Qualified
    case BanchoPyRankedStatus.Loved:
      return RankingStatus.Loved
  }
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

export function toRankingStatus(status: BanchoPyRankedStatus) {
  return toBanchoRankingStatus(status)
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
