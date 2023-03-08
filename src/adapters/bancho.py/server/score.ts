import type { PrismaClient, User } from '.prisma/bancho.py'
import {
  fromBanchoPyMode,
  toBanchoPyMode,
  toScore,
  toUserEssential,
} from '../transforms'

import type { Id } from '..'
import type { AbleToTransformToScores } from '../transforms'
import { prismaClient } from './prisma'
import { TSFilter } from '~/utils'
import type {
  ScoreProvider as Base,
} from '~/adapters/base/server'
export class ScoreProvider implements Base<bigint, Id> {
  db: PrismaClient

  config = {
    avatar: {
      domain: process.env.BANCHO_PY_AVATAR_DOMAIN,
    },
  }

  constructor() {
    this.db = prismaClient
  }

  #transformScore(dbScore: (AbleToTransformToScores & { user: User }) | null) {
    if (!dbScore) {
      return null
    }

    const [mode, ruleset] = fromBanchoPyMode(dbScore.mode)

    return Object.assign(
      toScore({
        score: dbScore,
        mode,
        ruleset,
      }),
      { user: toUserEssential({ user: dbScore.user, config: this.config }) },
    )
  }

  async id(id: bigint) {
    const dbScore = await this.db.score.findFirst({
      where: { id },
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

  async findOne(opt: Base.SearchQueryMany<Id> | Base.SearchId<bigint>) {
    if ('id' in opt) {
      return this.id(opt.id)
    }
    else {
      const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
      const score = await this.db.score.findFirst({
        where: {
          user: opt.user,
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

  async findMany(opt: Base.SearchQueryMany<Id>) {
    const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
    const scores = await this.db.score.findMany({
      where: {
        user: opt.user,
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
