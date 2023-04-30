import { idToString, stringToId, toBanchoPyMode, toMods, toRoles, toUserEssential, userEssentials } from '../transforms'
import type { Id } from '..'
import { hasRuleset } from '..'
import { client as redisClient } from './source/redis'
import { getPrismaClient } from './source/prisma'

import { modes as _modes } from '~/types/defs'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
} from '~/types/common'
import type { LeaderboardProvider as Base } from '~/adapters/base/server'

const leaderboardFields = {
  id: true,
  pp: true,
  accuracy: true,
  totalScore: true,
  rankedScore: true,
  plays: true,
} as const
export class LeaderboardProvider implements Base<Id> {
  static stringToId = stringToId
  static idToString = idToString
  db = getPrismaClient()
  redisClient = redisClient()

  config = {
    avatar: {
      domain: process.env.BANCHO_PY_AVATAR_DOMAIN,
    },
  }

  async getPPv2LiveLeaderboard(
    banchoPyMode: number,
    start: number,
    end: number,
    country?: string
  ) {
    if (this.redisClient?.isReady) {
      return await this.redisClient.zRange(
        country
          ? `bancho:leaderboard:${banchoPyMode}:${country}`
          : `bancho:leaderboard:${banchoPyMode}`,
        '+inf',
        1,
        {
          BY: 'SCORE',
          REV: true,
          LIMIT: {
            offset: start,
            count: end,
          },
        }
      )
    }
    throw new Error('redis is not ready')
  }

  async getLeaderboard<M extends Mode, RS extends LeaderboardRankingSystem>(opt: {
    mode: M
    ruleset: AvailableRuleset<M>
    rankingSystem: RS
    page: number
    pageSize: number
  }) {
    const { mode, ruleset, rankingSystem, page, pageSize } = opt

    const start = page * pageSize
    if (this.redisClient?.isReady && rankingSystem === 'ppv2') {
      try {
        const result: {
          id: number
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
        }[] = []
        const bPyMode = toBanchoPyMode(mode, ruleset)
        if (bPyMode === undefined) {
          throw new Error('no mode')
        }
        // TODO: banned players are included
        const rank = await this.getPPv2LiveLeaderboard(
          bPyMode,
          0,
          start + pageSize * 2
        ).then(res => res.map(Number))

        const [users, stats] = await Promise.all([
          /* optimized */
          this.db.user.findMany({
            where: {
              id: {
                in: rank,
              },
            },
            ...userEssentials,
          }),
          /* optimized */
          this.db.stat.findMany({
            where: {
              id: {
                in: rank,
              },
              mode: bPyMode,
            },
            select: leaderboardFields,
          }),
        ])
        for (const index in rank) {
          if (result.length >= start + pageSize) {
            break
          }
          const id = rank[index]
          const user = users.find(u => u.id === id)
          const stat = stats.find(s => s.id === id)

          if (!user || !stat || user.priv <= 2) {
            continue
          }

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
        return result.slice(start, start + pageSize).map((item, index) => ({
          user: {
            id: item.id,
            ingameId: item.id,
            name: item.name,
            safeName: item.safeName,
            flag: item.flag,
            avatarSrc:
              (this.config.avatar.domain
                && `https://${this.config.avatar.domain}/${item.id}`)
              || '',
            roles: toRoles(item.priv),
          },
          inThisLeaderboard: {
            ppv2: item.ppv2,
            accuracy: item.accuracy,
            playCount: item.playCount,
            totalScore: item.totalScore,
            rankedScore: item.rankedScore,
            // rank: item._rank,
            // order is correct but rank contains banned user, since we didn't check user priv before when selecting count.
            // calculate rank based on page size * index of this page.
            rank: BigInt(start + index + 1),
          },
        }))
      }
      catch (e) {
        console.error(e)
        return this.getDatabaseLeaderboard(opt)
      }
    }
    else {
      return this.getDatabaseLeaderboard(opt)
    }
  }

  async getDatabaseLeaderboard<M extends Mode, RS extends LeaderboardRankingSystem>({
    mode,
    ruleset,
    rankingSystem,
    page,
    pageSize,
  }: {
    mode: M
    ruleset: AvailableRuleset<M>
    rankingSystem: RS
    page: number
    pageSize: number
  }) {
    const start = page * pageSize
    const result = await this.db.stat.findMany({
      where: {
        user: {
          priv: {
            gt: 2,
          },
        },
        mode: toBanchoPyMode(mode, ruleset),
      },
      // include: {
      //   user: true,
      // },
      select: {
        user: true,
        ...leaderboardFields,
      },
      orderBy: rankingSystem === 'ppv2'
        ? {
            pp: 'desc',
          }
        : rankingSystem === 'rankedScore'
          ? {
              rankedScore: 'desc',
            }
          : rankingSystem === 'totalScore'
            ? {
                totalScore: 'desc',
              }
            : {},
      skip: start,
      take: pageSize,
    })

    return result.map(({ user, ...stat }, index) => ({
      user: toUserEssential({ user, config: this.config }),
      inThisLeaderboard: {
        ppv2: stat.pp,
        rankedScore: stat.rankedScore,
        totalScore: stat.totalScore,
        accuracy: stat.accuracy,
        playCount: stat.plays,
        rank: BigInt(start + index + 1),
      },
    }))
  }

  async getBeatmapLeaderboard(
    query: Base.BaseQueryOptionalMode & {
      rankingSystem: RankingSystem
      md5: string
    }
  ) {
    const { ruleset, rankingSystem, md5 } = query
    let { mode } = query
    if (!mode) {
      const beatmap = await this.db.map.findFirst({ where: { md5 } })
      if (!beatmap) {
        mode = 'osu'
      }
      else {
        mode = _modes[beatmap.mode]
      }
    }
    if (!hasRuleset(mode, ruleset)) {
      return []
    }

    let sort: { score: 'desc' } | { pp: 'desc' }
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
          md5,
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
