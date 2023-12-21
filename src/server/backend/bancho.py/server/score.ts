import { eq } from 'drizzle-orm'
import type { User } from 'prisma-client-bancho-py'
import type { Id } from '..'
import { normal } from '../constants'
import { config as _config } from '../env'
import {
  type AbleToTransformToScores,
  type PrismaAbleToTransformToScores,
  assertIsBanchoPyMode,
  fromBanchoPyMode,
  idToString,
  scoreIdToString,
  stringToId,
  stringToScoreId,
  toBanchoPyMode,
  toPrismaScore,
  toScore,
  toUserCompact,
} from '../transforms'
import * as schema from '../drizzle/schema'
import { prismaClient } from './source/prisma'
import { useDrizzle } from './source/drizzle'
import type {
  ScoreProvider as Base,
} from '$base/server'

const config = _config()
// eslint-disable-next-line n/prefer-global/process
const drizzle = await useDrizzle(schema, { logger: !!process.env.DEV })
export class ScoreProvider implements Base<bigint, Id> {
  static idToString = idToString
  static stringToId = stringToId

  static stringToScoreId = stringToScoreId
  static scoreIdToString = scoreIdToString

  /**
   * @deprecated prisma will be replaced by drizzle
   */
  db = prismaClient
  drizzle = drizzle
  config = config

  #transformPrismaScore(dbScore: (PrismaAbleToTransformToScores & { user: User })) {
    assertIsBanchoPyMode(dbScore.mode)
    const [mode, ruleset] = fromBanchoPyMode(dbScore.mode)

    return Object.assign(
      toPrismaScore({
        score: dbScore,
        mode,
        ruleset,
      }),
      { user: toUserCompact(dbScore.user, this.config) },
    )
  }

  #transformScore(dbScore: AbleToTransformToScores & { user: typeof schema['users']['$inferSelect'] }) {
    const [mode, ruleset] = fromBanchoPyMode(dbScore.mode)
    return Object.assign(
      toScore({
        score: dbScore,
        mode,
        ruleset,
      }),
      { user: toUserCompact(dbScore.user, this.config) },
    )
  }

  async id(id: bigint) {
    const result = await this.drizzle.query.scores.findFirst({
      where: eq(schema.scores.id, id),
      with: {
        user: true,
        beatmap: {
          with: {
            source: true,
          },
        },
      },
    }) ?? raise(Error, 'score not found')

    return this.#transformScore(result)
  }

  async findOne(opt: Base.SearchQuery<Id>) {
    const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
    const score = await this.db.score.findFirstOrThrow({
      where: {
        user: {
          ...opt.user,
        },
        beatmap: opt.beatmap,
        mode: banchoPyMode,
      },
      include: {
        beatmap: {
          include: {
            source: true,
          },
        },
        user: true,
      },
    })
    return this.#transformPrismaScore(score)
  }

  async findMany(opt: Base.SearchQuery<Id>) {
    const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
    const scores = await this.db.score.findMany({
      where: {
        user: {
          priv: { in: normal },
          ...opt.user,
          clan: opt.user?.clan
            ? {
                id: opt.user.clan.id,
                name: opt.user.clan.name,
                tag: opt.user.clan.badge,
              }
            : undefined,
        },
        beatmap: opt.beatmap,
        mode: banchoPyMode,
      },
      include: {
        beatmap: {
          include: {
            source: true,
          },
        },
        user: true,
      },
    })
    return scores.map(this.#transformPrismaScore).filter(TSFilter)
  }
}
