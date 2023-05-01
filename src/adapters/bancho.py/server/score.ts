import type { User } from '.prisma/bancho.py'
import {
  fromBanchoPyMode,
  idToString,
  scoreIdToString,
  stringToId,
  stringToScoreId, toBanchoPyMode, toScore, toUserEssential,
} from '../transforms'

import type { Id } from '..'
import type { AbleToTransformToScores } from '../transforms'
import { getPrismaClient } from './source/prisma'
import { TSFilter } from '~/utils'
import type {
  ScoreProvider as Base,
} from '~/adapters/base/server'

export class ScoreProvider implements Base<bigint, Id> {
  static idToString = idToString
  static stringToId = stringToId

  static stringToScoreId = stringToScoreId
  static scoreIdToString = scoreIdToString

  db = getPrismaClient()

  config = {
    avatar: {
      domain: process.env.AVATAR_DOMAIN,
    },
  }

  #transformScore(dbScore: (AbleToTransformToScores & { user: User })) {
    const [mode, ruleset] = fromBanchoPyMode(dbScore.mode)

    return Object.assign(
      toScore({
        score: dbScore,
        mode,
        ruleset,
      }),
      { user: toUserEssential({ user: dbScore.user, config: this.config }) }
    )
  }

  async id(id: bigint) {
    const dbScore = await this.db.score.findFirstOrThrow({
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

  // #throw() {
  //   if (!dbScore) {
  //     throw new TRPCError({
  //       code: 'NOT_FOUND',
  //       message: `unable to find score ${id} in database`,
  //     })
  //   }
  // }

  async findOne(opt: Base.SearchQueryMany<Id> | Base.SearchId<bigint>) {
    if ('id' in opt) {
      return this.id(opt.id)
    }
    else {
      const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
      const score = await this.db.score.findFirstOrThrow({
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
