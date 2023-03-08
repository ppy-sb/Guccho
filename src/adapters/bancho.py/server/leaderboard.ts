import { modes as _modes } from '~/types/defs'

import { prismaClient } from '../prisma'
import { client as redisClient } from '../redis-client'
import { toBanchoPyMode, toMods, toRoles, toUserEssential } from '../transforms'

import type { PrismaClient } from '.prisma/bancho.py'
import type { BanchoPyMode } from '../enums'
import type { Id } from '..'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
} from '~/types/common'
import type { LeaderboardProvider as Base } from '~/adapters/base/server'

export class LeaderboardProvider
implements Base<Id> {
  db: PrismaClient
  redisClient?: ReturnType<typeof redisClient>

  config = {
    avatar: {
      domain: process.env.BANCHO_PY_AVATAR_DOMAIN,
    },
  }

  constructor() {
    this.db = prismaClient

    this.redisClient = redisClient()
  }

  async getLeaderboard<M extends Mode>({
    mode,
    ruleset,
    rankingSystem,
    page,
    pageSize,
  }: {
    mode: M
    ruleset: AvailableRuleset<M>
    rankingSystem: LeaderboardRankingSystem
    page: number
    pageSize: number
  }) {
    if (rankingSystem === 'ppv1') {
      return []
    }
    const start = page * pageSize

    const result = await prismaClient.$queryRawUnsafe<
      Array<{
        id: Id
        name: string
        safeName: string
        flag: string
        priv: number

        mode: BanchoPyMode
        _rank: bigint
        accuracy: number
        totalScore: bigint
        rankedScore: bigint
        ppv2: number
        playCount: number
      }>
    >(/* sql */ `
  WITH ranks AS (
    SELECT
    ${rankingSystem === 'ppv2'
        ? /* sql */ `
      RANK () OVER (
        PARTITION BY stat.mode
        ORDER BY stat.pp desc
      ) as _rank,`
        : ''
      }${rankingSystem === 'totalScore'
        ? /* sql */ `
      RANK () OVER (
        PARTITION BY stat.mode
        ORDER BY stat.tscore desc
      ) as _rank,`
        : ''
      }${rankingSystem === 'rankedScore'
        ? /* sql */ `
      RANK () OVER (
        PARTITION BY stat.mode
        ORDER BY stat.rscore desc
      ) as _rank,`
        : ''
      }
      user.id,
      user.name,
      user.safe_name as safeName,
      user.country as flag,
      user.priv,
      stat.pp as ppv2,
      stat.acc as accuracy,
      stat.rscore as rankedScore,
      stat.tscore as totalScore,
      stat.plays as playCount,
      stat.mode
    FROM stats stat
    LEFT JOIN users user
    ON stat.id = user.id 
    WHERE stat.mode = ${toBanchoPyMode(mode, ruleset)} AND user.priv > 2
  )
  SELECT 
    id,
    name,
    safeName,
    flag,
    _rank,
    priv,

    ppv2,
    accuracy,
    rankedScore,
    totalScore,
    playCount
  FROM ranks
  WHERE _rank > 0
  ORDER BY _rank ASC
  LIMIT ${start}, ${pageSize}
  `)

    return result.map(item => ({
      user: {
        id: item.id,
        ingameId: item.id,
        name: item.name,
        safeName: item.safeName,
        flag: item.flag,
        avatarSrc:
          (this.config.avatar.domain
            && `https://${this.config.avatar.domain}/${item.id}`)
          || undefined,
        roles: toRoles(item.priv),
      },
      inThisLeaderboard: {
        ppv2: item.ppv2,
        accuracy: item.accuracy,
        totalScore: item.totalScore,
        rankedScore: item.rankedScore,
        playCount: item.playCount,
        rank: item._rank,
      },
    }))
  }

  async getBeatmapLeaderboard(
    query: Base.BaseQuery & {
      rankingSystem: RankingSystem
      id: Id
    },
  ) {
    const { ruleset, rankingSystem, id } = query
    let { mode } = query
    if (!mode) {
      const beatmap = await this.db.map.findFirst({ where: { id } })
      if (!beatmap) {
        mode = 'osu'
      }
      else {
        mode = _modes[beatmap.mode]
      }
    }
    let sort = {}
    if (rankingSystem === 'score') {
      sort = {
        score: 'desc',
      }
    }
    else if (rankingSystem === 'ppv2') {
      sort = {
        pp: 'desc',
      }
    }
    else {
      return []
    }

    const scores = await this.db.score.findMany({
      include: {
        user: true,
      },
      where: {
        beatmap: {
          id,
        },
        mode: toBanchoPyMode(mode, ruleset),
        status: {
          in: [2, 3],
        },
      },
      orderBy: sort,
    })
    return scores.map((item, index) => ({
      user: toUserEssential({ user: item.user, config: this.config }),
      score: {
        id: item.id.toString(),
        ppv2: item.pp,
        accuracy: item.acc,
        score: item.score,
        playedAt: item.playTime,
        mods: toMods(item.mods),
      },
      rank: index,
    }))
  }
}
