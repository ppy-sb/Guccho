import { PrismaClient } from '@prisma/client'
import { BanchoPyMode, toBanchoPyMode } from './enums'
import { Range } from '~/types/common'

import {
  IdType,
  Mode as _Mode,
  Ruleset as _Ruleset,
  RankingSystem as _RankingSystem
} from '$/bancho.py/config'

const db = new PrismaClient()

export async function getLeaderboard<
  Mode extends _Mode = _Mode,
  Ruleset extends _Ruleset = _Ruleset,
  RankingSystem extends _RankingSystem = _RankingSystem
> ({
  mode,
  ruleset,
  rankingSystem,
  page,
  pageSize
}: {
  mode: Mode
  ruleset: Ruleset
  rankingSystem: RankingSystem,
  page: Range<0, 10>
  pageSize: Range<20, 51>
}) {
  const start = page * pageSize
  const end = start + pageSize

  const sql = /* sql */`
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
  LIMIT ${start}, ${end}
  `

  const result = await db.$queryRawUnsafe<
    Array<{
      id: IdType
      name: string,
      safeName: string,
      flag: string,

      mode: BanchoPyMode
      _rank: bigint,
      accuracy: number,
      totalScore: bigint,
      rankedScore: bigint,
      ppv2: number,
      playCount: number
    }>
  >(sql)

  return result.map(item => ({
    user: {
      id: item.id,
      name: item.name,
      safeName: item.safeName,
      flag: item.flag,
      avatarUrl: 'https://a.ppy.sb/' + item.id,

      inThisLeaderboard: {
        ppv2: item.ppv2,
        accuracy: item.accuracy,
        totalScore: item.totalScore,
        rankedScore: item.rankedScore,
        playCount: item.playCount
      }
    },
    rank: item._rank
  }))
}
