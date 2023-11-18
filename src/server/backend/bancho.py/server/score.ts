import type { User } from 'prisma-client-bancho-py'
import type { Id } from '..'
import { normal } from '../constants'
import { config as _config } from '../env'
import {
  type AbleToTransformToScores,
  assertIsBanchoPyMode,
  fromBanchoPyMode,
  idToString,
  scoreIdToString,
  stringToId,
  stringToScoreId,
  toBanchoPyMode,
  toScore,
  toUserCompact,
} from '../transforms'
import { getPrismaClient } from './source/prisma'
import type {
  ScoreProvider as Base,
} from '$base/server'

const config = _config()

export class ScoreProvider implements Base<bigint, Id> {
  static idToString = idToString
  static stringToId = stringToId

  static stringToScoreId = stringToScoreId
  static scoreIdToString = scoreIdToString

  db = getPrismaClient()

  config = config

  #transformScore(dbScore: (AbleToTransformToScores & { user: User })) {
    assertIsBanchoPyMode(dbScore.mode)
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
    const dbScore = await this.db.score.findFirstOrThrow({
      where: {
        id,
        user: {
          priv: { in: normal },
        },
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
    return this.#transformScore(dbScore)
  }

  async findOne(opt: Base.SearchQuery<Id> | Base.SearchId<bigint>) {
    if ('id' in opt) {
      return this.id(opt.id)
    }
    else {
      const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
      const score = await this.db.score.findFirstOrThrow({
        where: {
          user: {
            priv: {
              in: normal,
            },
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
      return this.#transformScore(score)
    }
  }

  async findMany(opt: Base.SearchQuery<Id>) {
    const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
    const scores = await this.db.score.findMany({
      where: {
        user: {
          priv: { in: normal },
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
    return scores.map(this.#transformScore).filter(TSFilter)
  }
}
