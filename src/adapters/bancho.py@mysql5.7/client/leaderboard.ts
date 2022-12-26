import type {
  Id,
} from '../config'
import { prismaClient } from '.'
import type { BanchoPyMode } from '~/adapters/bancho.py/enums'
import { toBanchoPyMode } from '~/adapters/bancho.py/enums'
import { LeaderboardDataProvider as BanchoPyLeaderboardDataProvider } from '~/adapters/bancho.py/client'
import { toRoles } from '~/adapters/bancho.py/transforms'
import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'

export class LeaderboardDataProvider extends BanchoPyLeaderboardDataProvider {
  async getOverallLeaderboard({
    mode,
    ruleset,
    rankingSystem,
    page,
    pageSize,
  }: {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: OverallLeaderboardRankingSystem
    page: number
    pageSize: number
  }) {
    if (rankingSystem === 'ppv1')
      return []
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
    >(/* sql */`
  SELECT 
  user.id,
  user.name,
  user.safe_name AS safeName,
  user.country AS flag,
  user.priv,
  stat.pp AS ppv2,
  stat.acc AS accuracy,
  stat.rscore AS rankedScore,
  stat.tscore AS totalScore,
  stat.plays AS playCount,
  stat.mode,
  ${rankingSystem === 'ppv2' ? '(SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = stat.mode AND s.pp > stat.pp) as _rank' : ''}
  ${rankingSystem === 'totalScore' ? '(SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = stat.mode AND s.tscore > stat.tscore) as _rank' : ''}
  ${rankingSystem === 'rankedScore' ? '(SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = stat.mode AND s.rscore > stat.rscore) as _rank' : ''}
FROM stats stat
LEFT JOIN users user
ON stat.id = user.id 
WHERE stat.mode = ${toBanchoPyMode(mode, ruleset)} AND user.priv > 2
HAVING _rank > 0
ORDER BY _rank ASC
LIMIT ${start}, ${pageSize}`)

    return result.map((item, index) => ({
      user: {
        id: item.id,
        ingameId: item.id,
        name: item.name,
        safeName: item.safeName,
        flag: item.flag,
        avatarUrl: `https://a.ppy.sb/${item.id}`,
        roles: toRoles(item.priv),
      },
      inThisLeaderboard: {
        ppv2: item.ppv2,
        accuracy: item.accuracy,
        totalScore: item.totalScore,
        rankedScore: item.rankedScore,
        playCount: item.playCount,
        // rank: item._rank,
        // order is correct but rank contains banned user, since we didn't check user priv before when selecting count.
        // calculate rank based on page size * index of this page.
        rank: BigInt(start + index + 1),
      },
    }))
  }
}
