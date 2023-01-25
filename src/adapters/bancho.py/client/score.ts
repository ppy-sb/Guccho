import type { PrismaClient } from '@prisma/client'
import type { Id } from '../config'
import { toScore } from '../transforms/scores'
import { fromBanchoPyMode, toBanchoPyMode } from '../enums'
import type { AbleToTransformToScores } from '../transforms'
import type { ScoreProvider, SearchId, SearchQueryMany } from './../../base/client/score'
import { prismaClient } from '.'

import { TSFilter } from '~/utils'

export default class BanchoPyScore implements ScoreProvider<bigint, Id> {
  db: PrismaClient

  constructor() {
    this.db = prismaClient
  }

  #transformScore(dbScore: AbleToTransformToScores | null) {
    if (!dbScore)
      return null

    const [mode, ruleset] = fromBanchoPyMode(dbScore.mode)

    return toScore({
      score: dbScore,
      mode,
      ruleset,
    })
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
      },
    })
    return this.#transformScore(dbScore)
  }

  async findOne(opt: SearchQueryMany<Id> | SearchId<bigint>) {
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
        },
      })
      return this.#transformScore(score)
    }
  }

  async findMany(opt: SearchQueryMany<Id>) {
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
      },
    })
    return scores.map(this.#transformScore).filter(TSFilter)
  }
}
