import { request } from 'node:http'
import type { H3Event } from 'h3'
import type { User } from 'prisma-client-bancho-py'
import {
  assertIsBanchoPyMode,
  fromBanchoPyMode,
  idToString,
  scoreIdToString,
  stringToId,
  stringToScoreId, toBanchoPyMode, toScore, toUserCompact,
} from '../transforms'

import type { Id } from '..'
import type { AbleToTransformToScores } from '../transforms'
import { config as _config } from '../env'
import { abnormal } from '../constants'
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
          priv: { not: { in: abnormal } },
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

  async findOne(opt: Base.SearchQueryMany<Id> | Base.SearchId<bigint>) {
    if ('id' in opt) {
      return this.id(opt.id)
    }
    else {
      const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
      const score = await this.db.score.findFirstOrThrow({
        where: {
          user: {
            priv: {
              not: {
                in: abnormal,
              },
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

  async findMany(opt: Base.SearchQueryMany<Id>) {
    const banchoPyMode = toBanchoPyMode(opt.mode, opt.ruleset)
    const scores = await this.db.score.findMany({
      where: {
        user: {
          priv: { not: { in: abnormal } },
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

  // async replay(id: bigint): Promise<ReadableStream<Uint8Array>> {
  //   this.config.api?.v1 ?? raise(Error, 'need bancho.py api to work.')

  //   const url = new URL(`${this.config.api?.v1}/get_replay`)
  //   url.searchParams.set('id', id.toString())

  //   const req = await fetch(url)

  //   return (req.ok && req.body) || raise(Error, 'no replay')
  // }

  async downloadReplay(id: bigint, ev: H3Event): Promise<void> {
    this.config.api?.v1 ?? raise(Error, 'need bancho.py api to work.')

    const url = new URL(`${this.config.api?.v1}/get_replay`)
    url.searchParams.set('id', id.toString())

    return new Promise((resolve, reject) => {
      const req = request(url, (im) => {
        im.on('error', reject)
        if ((im.statusCode || 0) >= 400) {
          reject(new Error('Returned bad code'))
        }
        else {
          ev.node.res.writeHead(im.statusCode as number, im.statusMessage, im.rawHeaders)
          im.pipe(ev.node.res)
          im.on('end', resolve)
        }
      })

      req.on('error', reject)

      req.end() // Send the request
    })
  }
}
