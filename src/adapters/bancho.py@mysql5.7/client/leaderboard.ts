import type {
  Id,
} from '../config'

import { prismaClient } from '.'

import { toBanchoPyMode } from '~/adapters/bancho.py/enums'
import { LeaderboardDataProvider as BanchoPyLeaderboardDataProvider } from '~/adapters/bancho.py/client'
import { toRoles } from '~/adapters/bancho.py/transforms'

import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'

export class LeaderboardDataProvider extends BanchoPyLeaderboardDataProvider {
  async getPPv2LiveLeaderboard(banchoPyMode: number, start: number, end: number, country?: string) {
    if (this.redisClient?.isReady) {
      return await this.redisClient.zRange(
        country ? `bancho:leaderboard:${banchoPyMode}:${country}` : `bancho:leaderboard:${banchoPyMode}`,
        '+inf',
        1,
        {
          BY: 'SCORE',
          REV: true,
          LIMIT: {
            offset: start,
            count: end,
          },
        },
      )
    }
    throw new Error('redis is not ready')
  }

  // TODO: now broken
  async overallLeaderboardFromDatabase(opt: {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: OverallLeaderboardRankingSystem
    page: number
    pageSize: number
  }) {
    const { rankingSystem, mode, ruleset, page, pageSize } = opt
    const start = page * pageSize
    return await prismaClient.$queryRawUnsafe<
      Array<{
        id: Id
        name: string
        safeName: string
        flag: string
        priv: number

        _rank: bigint
        accuracy: number
        totalScore: bigint
        rankedScore: bigint
        ppv2: number
        playCount: number
      }>
    >(/* sql */`
  SELECT 
  ${rankingSystem === 'ppv2' ? '(SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = stat.mode AND s.pp > stat.pp) as _rank,' : ''}
  ${rankingSystem === 'totalScore' ? '(SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = stat.mode AND s.tscore > stat.tscore) as _rank,' : ''}
  ${rankingSystem === 'rankedScore' ? '(SELECT COUNT(*) + 1 FROM stats s WHERE s.mode = stat.mode AND s.rscore > stat.rscore) as _rank,' : ''}
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
  stat.mode
FROM stats stat
LEFT JOIN users user
ON stat.id = user.id 
WHERE stat.mode = ${toBanchoPyMode(mode, ruleset)} AND user.priv > 2
HAVING _rank > 0
ORDER BY _rank ASC
LIMIT ${start}, ${pageSize}`)
  }

  async getOverallLeaderboard(opt: {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: OverallLeaderboardRankingSystem
    page: number
    pageSize: number
  }) {
    const {
      mode,
      ruleset,
      rankingSystem,
      page,
      pageSize,
    } = opt
    let result: Awaited<ReturnType<LeaderboardDataProvider['overallLeaderboardFromDatabase']>> = []
    const start = page * pageSize
    if (!this.redisClient?.isReady) {
      result = await this.overallLeaderboardFromDatabase(opt)
    }
    else {
      if (rankingSystem === 'ppv1')
        return []

      if (rankingSystem === 'ppv2') {
        try {
          const bPyMode = toBanchoPyMode(mode, ruleset)
          if (bPyMode === undefined)
            throw new Error('no mode')
          // TODO: banned players are included
          const rank = await this.getPPv2LiveLeaderboard(bPyMode, 0, start + pageSize * 2).then(res => res.map(Number))

          const [users, stats] = await Promise.all([
            this.db.user.findMany({
              where: {
                id: {
                  in: rank,
                },
              },
            }),
            this.db.stat.findMany({
              where: {
                id: {
                  in: rank,
                },
                mode: bPyMode,
              },
            }),
          ])
          for (const index in rank) {
            if (result.length >= start + pageSize)
              break
            const id = rank[index]
            const user = users.find(u => u.id === id)
            const stat = stats.find(s => s.id === id)

            if (!user || !stat || user.priv <= 2)
              continue

            result.push({
              id: user.id,
              name: user.name,
              safeName: user.safeName,
              flag: user.country,
              ppv2: stat.pp,
              priv: user.priv,
              _rank: BigInt(start + parseInt(index) + 1),
              accuracy: stat.accuracy,
              totalScore: stat.totalScore,
              rankedScore: stat.rankedScore,
              playCount: stat.plays,
            })
          }
        }
        catch (e) {
          console.error(e)
          result = await this.overallLeaderboardFromDatabase(opt)
        }
      }
      else {
        result = await this.overallLeaderboardFromDatabase(opt)
      }
    }

    return result.slice(start, start + pageSize).map((item, index) => ({
      user: {
        id: item.id,
        ingameId: item.id,
        name: item.name,
        safeName: item.safeName,
        flag: item.flag,
        avatarSrc: (process.env.BANCHO_PY_AVATAR_DOMAIN && `https://${process.env.BANCHO_PY_AVATAR_DOMAIN}/${item.id}`) || '',
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
