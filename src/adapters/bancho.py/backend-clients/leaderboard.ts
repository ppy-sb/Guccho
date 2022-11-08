import { PrismaClient } from '@prisma/client'
import { getBaseUser } from './user'
import { BanchoPyMode, toBanchoPyMode } from './enums'
import { AvailableRankingSystems, IdType } from '~/adapters/bancho.py/config'
import {
  Range,
  Mode as _Mode,
  Ruleset as _Ruleset
} from '~/types/common'

const db = new PrismaClient()

export async function getLeaderboard<
  Mode extends _Mode = _Mode,
  Ruleset extends _Ruleset = _Ruleset,
  RankingSystem extends AvailableRankingSystems = AvailableRankingSystems
> ({
  mode,
  ruleset,
  rankingSystem,
  page,
  pageSize
}: {
  mode: Mode
  ruleset: Ruleset
  rankingSystem: RankingSystem
  page: Range<0, 10>
  pageSize: Range<50, 100>
}) {
  const start = page * pageSize
  const end = start + pageSize
  const sql = /* sql */`
  WITH ranks AS (
    SELECT
      id,
${rankingSystem === 'ppv2'
      ? /* sql */ `
      RANK () OVER (
        PARTITION BY mode
        ORDER BY pp desc
      ) as _rank,`
      : ''
}${rankingSystem === 'totalScore'
      ? /* sql */ `
      RANK () OVER (
        PARTITION BY mode
        ORDER BY tscore desc
      ) as _rank,`
        : ''
}${rankingSystem === 'rankedScore'
      ? /* sql */ `
      RANK () OVER (
        PARTITION BY mode
        ORDER BY rscore desc
      ) as _rank,`
      : ''
      }
      mode
    FROM stats
    WHERE mode = ${toBanchoPyMode(mode, ruleset)}
  )
  SELECT * FROM ranks
  WHERE _rank > 0
  ORDER BY _rank ASC
  LIMIT ${start}, ${end}
  `
  const result = await db.$queryRawUnsafe<
    Array<{
      id: IdType
      mode: BanchoPyMode
      _rank: bigint
    }>
  >(sql)

  // TODO: fetch user in batch #performance
  return await Promise.all(result.map(async item => ({
    user: await getBaseUser(item.id),
    rank: item._rank
  })))
}
