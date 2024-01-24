import type {
  Map as DBMap,
  Score as DBScore,
  Source,
} from 'prisma-client-bancho-py'

import type { InferSelectModel } from 'drizzle-orm'

import { $enum } from 'ts-enum-util'
import type { Id } from '..'
import { BanchoPyRankedStatus } from '../enums'
import type * as schema from '../drizzle/schema'
import { fromBanchoMode } from '.'
import { type BaseBeatmapCompact, type BaseBeatmapset, BeatmapSource, type BeatmapWithMeta, type Foreign, type Local, type LocalBeatmapCompact, type LocalBeatmapset, RankingStatus, type ReferencedBeatmapCompact, type ReferencedBeatmapset, type Unknown } from '~/def/beatmap'
import { StableMod } from '~/def/score'

function createBanchoAssets(beatmapset: { id: unknown }) {
  const v = Math.floor(new Date().getTime() / 1000)

  return {
    'cover': `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/cover.jpg?${v}`,
    'cover@2x': `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/cover@2x.jpg?${v}`,
    'list': `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/list.jpg?${v}`,
    'list@2x': `https://assets.ppy.sh/beatmaps/${beatmapset.id}/covers/list@2x.jpg?${v}`,
  }
}

function createMeta(beatmap: { artist: string; title: string }) {
  return {
    intl: {
      artist: beatmap.artist,
      title: beatmap.title,
    },
  }
}
function toBeatmapsetReal<IdType, Source extends BeatmapSource>(beatmapset: { id: IdType }, luckyOneBeatmapInBeatmapset: { artist: string; title: string }, source: Source) {
  const isBancho = source === BeatmapSource.Bancho
  const base: BaseBeatmapset<IdType> = {
    id: beatmapset.id,
    source,
    meta: createMeta(luckyOneBeatmapInBeatmapset),
    assets: isBancho ? createBanchoAssets(beatmapset) : {},
  }
  if (source === BeatmapSource.Bancho || source === BeatmapSource.PrivateServer) {
    (base as ReferencedBeatmapset<IdType, IdType>).foreignId = beatmapset.id
    return (base as ReferencedBeatmapset<IdType, IdType>)
  }
  return base as LocalBeatmapset<IdType>
}

export function toBeatmapSourcePrisma(source: Source['server']) {
  return source === 'bancho'
    ? BeatmapSource.Bancho
    : source === 'privateServer'
      ? BeatmapSource.PrivateServer
      : BeatmapSource.Unknown
}
/**
 * @deprecated Prisma will be replaced by drizzle
 */
export function toBeatmapsetPrisma(beatmapset: Source, luckyOneBeatmapInBeatmapset: DBMap) {
  return toBeatmapsetReal(
    beatmapset,
    luckyOneBeatmapInBeatmapset,
    toBeatmapSourcePrisma(beatmapset.server)
  )
}
export function toBeatmapSource(source: 'osu!' | 'private') {
  return source === 'osu!'
    ? BeatmapSource.Bancho
    : source === 'private'
      ? BeatmapSource.PrivateServer
      : BeatmapSource.Unknown
}
export function toBeatmapset<T>(beatmapset: { id: T; server: 'osu!' | 'private' }, luckyOneBeatmapInBeatmapset: { artist: string; title: string }) {
  return toBeatmapsetReal(
    beatmapset,
    luckyOneBeatmapInBeatmapset,
    toBeatmapSource(beatmapset.server)
  )
}
function isForeign(source: BeatmapSource): source is Foreign {
  return (source === BeatmapSource.PrivateServer || source === BeatmapSource.Bancho)
}
export function toBeatmapCompact<Source extends BeatmapSource>(beatmap: {
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
}, source: Source) {
  const baseBeatmap: BaseBeatmapCompact = {
    version: beatmap.version,
    md5: beatmap.md5,
    creator: beatmap.creator,
    lastUpdate: beatmap.lastUpdate,
    mode: fromBanchoMode(beatmap.mode),
    properties: {
      circleSize: beatmap.cs,
      approachRate: beatmap.ar,
      accuracy: beatmap.od,
      hpDrain: beatmap.hp,
      starRate: beatmap.diff,
      bpm: beatmap.bpm,
      // int
      totalLength: beatmap.totalLength,
      maxCombo: beatmap.maxCombo,
      // TODO: count data not available?
      count: {
        circles: 0,
        sliders: 0,
        spinners: 0,
      },
    },
  }
  return isForeign(source)
    ? <ReferencedBeatmapCompact<Id, Id>>{
      ...baseBeatmap,
      id: beatmap.id,
      foreignId: beatmap.id,
      source: source as Foreign,
    }
    : <LocalBeatmapCompact<Id>>{
      ...baseBeatmap,
      source: source as Local | Unknown,
      id: beatmap.id,
    }
}

// toGucchoBeatmapSource(input: )

/**
 * @deprecated Prisma will be replaced by drizzle
 */
export function toBeatmapWithBeatmapsetPrisma(
  beatmap: DBMap & {
    source: Source
  },
) {
  const status = toRankingStatus(beatmap.status) || RankingStatus.WIP
  const beatmapset = toBeatmapsetPrisma(beatmap.source, beatmap)
  return Object.assign(toBeatmapCompact(beatmap, BeatmapSource.Bancho), {
    status,
    beatmapset,
  })
}

export function toBeatmapWithBeatmapset(
  beatmap: typeof schema['beatmaps']['$inferSelect'] & {
    source: typeof schema['sources']['$inferSelect']
  },
): BeatmapWithMeta<RankingStatus, typeof schema['beatmaps']['$inferSelect']['id'], typeof schema['beatmaps']['$inferSelect']['id']> {
  const status = toRankingStatus(beatmap.status) || RankingStatus.WIP
  if (status === RankingStatus.Deleted || status === RankingStatus.NotFound) {
    return {
      status,
    }
  }
  const beatmapset = toBeatmapset(beatmap.source, beatmap)
  return Object.assign(
    toBeatmapCompact(beatmap, toBeatmapSource(beatmap.source.server)),
    {
      status,
      beatmapset,
    }
  ) as
    | (ReferencedBeatmapCompact<Id, Id> & { status: typeof status; beatmapset: ReferencedBeatmapset<Id, Id> })
    | (LocalBeatmapCompact<Id> & { status: typeof status; beatmapset: LocalBeatmapset<Id> })
}
export type AbleToTransformToScores = InferSelectModel<typeof schema['scores']> & {
  beatmap: InferSelectModel<typeof schema['beatmaps']> & {
    source: InferSelectModel<typeof schema['sources']>
  }
}

export type PrismaAbleToTransformToScores = DBScore & {
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
