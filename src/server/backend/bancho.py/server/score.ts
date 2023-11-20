import { TRPCError } from '@trpc/server'
import type { Prisma, User } from 'prisma-client-bancho-py'
import type { Id } from '..'
import { normal } from '../constants'
import { BanchoPyScoreStatus } from '../enums'
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
import { Rank } from '~/def'
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

  async findOne(opt: Base.SearchQuery<Id>) {
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
    return scores.map(this.#transformScore).filter(TSFilter)
  }

  async #createScoreSearchQuery(opt: Base.SearchQuery<Id>) {
    const { user, mode, ruleset, rankingSystem } = opt
    const _mode = toBanchoPyMode(mode, ruleset)
    if (_mode === undefined) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'unsupported mode',
      })
    }

    const orderBy: Prisma.ScoreFindManyArgs['orderBy'] = {}
    if (rankingSystem === Rank.PPv2) {
      orderBy.pp = 'desc'
    }
    else if (rankingSystem === Rank.RankedScore) {
      orderBy.score = 'desc'
    }
    else if (rankingSystem === Rank.TotalScore) {
      orderBy.score = 'desc'
    }
    else {
      throw new Error('unknown ranking system')
    }
    const scores = await this.db.score.findMany({
      where: {
        user,
        mode: _mode,
        status: BanchoPyScoreStatus.Pick,
        beatmap: {
          status: {
            in: [BanchoPyScoreStatus.Pick, BanchoPyScoreStatus.Normal],
          },
        },
      },
      include: {
        beatmap: {

          include: {
            source: true,
          },
        },
      },
      orderBy,
      skip: start,
      take: perPage,
    })
    return toRankingSystemScores({ scores, rankingSystem, mode }).map(score =>
      Object.assign(score, {
        id: score.id.toString(),
      }),
    )
  }
}
