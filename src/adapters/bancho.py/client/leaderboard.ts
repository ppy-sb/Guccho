import { BanchoPyMode, toBanchoPyMode } from '../enums'
import { prismaClient as db } from './index'
import { Mode, Range, RankingSystem, Ruleset } from '~/types/common'

import {
  IdType
} from '$/config'

export async function getLeaderboard ({
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
  if (rankingSystem === 'ppv1') { return [] }
  const start = page * pageSize
  const end = start + pageSize

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
  LIMIT ${start}, ${end}
  `)

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
