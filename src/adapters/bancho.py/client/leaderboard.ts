import type { PrismaClient } from '@prisma/client'
import type { BanchoPyMode } from '../enums'
import { toBanchoPyMode } from '../enums'
import { LeaderboardDataProvider } from '../../base/client/leaderboard'
import { prismaClient } from './index'
import type { Mode, Range, RankingSystem, Ruleset } from '~/types/common'

import type {
  IdType,
} from '$/config'

export default class BanchoPyLeaderboard extends LeaderboardDataProvider<IdType> implements LeaderboardDataProvider<IdType> {
  db: PrismaClient
  constructor({ client }: { client: PrismaClient } = { client: prismaClient }) {
    super()
    this.db = client
  }

  async getTotalLeaderboard({
    mode,
    ruleset,
    rankingSystem,
    page,
    pageSize,
  }: {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: RankingSystem
    page: Range<0, 10>
    pageSize: Range<20, 51>
  }) {
    if (rankingSystem === 'ppv1')
      return []
    const start = page * pageSize

    const result = await prismaClient.$queryRawUnsafe<
      Array<{
        id: IdType
        name: string
        safeName: string
        flag: string

        mode: BanchoPyMode
        _rank: bigint
        accuracy: number
        totalScore: bigint
        rankedScore: bigint
        ppv2: number
        playCount: number
      }>
    >(/* sql */`
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
        name: item.name,
        safeName: item.safeName,
        flag: item.flag,
        avatarUrl: `https://a.ppy.sb/${item.id}`,

        inThisLeaderboard: {
          ppv2: item.ppv2,
          accuracy: item.accuracy,
          totalScore: item.totalScore,
          rankedScore: item.rankedScore,
          playCount: item.playCount,
        },
      },
      rank: item._rank,
    }))
  }

  async getBeatmapLeaderboard(query: LeaderboardDataProvider.BaseQuery & { id: IdType }) {
    const { mode, ruleset, rankingSystem, id } = query
    let sort = {}
    if (['totalScore', 'rankedScore'].includes(rankingSystem)) {
      sort = {
        score: 'desc',
      }
    }
    else if (rankingSystem === 'ppv2') {
      sort = {
        pp: 'desc',
      }
    }
    else { return [] }

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
      user: {
        id: item.user.id,
        name: item.user.name,
        safeName: item.user.safeName,
        flag: item.user.country,
        avatarUrl: `https://a.ppy.sb/${item.user.id}`,
      },
      score: {
        ppv2: item.pp,
        accuracy: item.acc,
        score: item.score,
      },
      rank: index,
    }))
  }
}
