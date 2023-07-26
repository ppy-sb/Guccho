import { Logger } from '../log'
import {
  idToString,
  stringToId,
  toBanchoPyMode,
  toMods,
  toRoles,
  toUserEssential,
} from '../transforms'
import {
  userEssentials,
} from '../db-query'
import type { Id } from '..'
import { hasRuleset } from '..'

import { client as redisClient } from './source/redis'
import { getPrismaClient } from './source/prisma'
import { env } from '~/server/env'

import { Mode, Rank, modes as _modes } from '~/def'
import type {
  ActiveMode,
  AvailableRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
} from '~/def/common'
import type { LeaderboardProvider as Base } from '$base/server'
import type { CountryCode } from '~/def/country-code'

const logger = Logger.child({ label: 'leaderboard', backend: 'bancho.py' })

const leaderboardFields = {
  id: true,
  pp: true,
  accuracy: true,
  [Rank.TotalScore]: true,
  [Rank.RankedScore]: true,
  plays: true,
} as const

export class LeaderboardDatabaseProvider implements Base<Id> {
  static stringToId = stringToId
  static idToString = idToString
  db = getPrismaClient()

  config = {
    avatar: {
      domain: env.AVATAR_DOMAIN,
    },
  }

  async getLeaderboard<M extends ActiveMode, RS extends LeaderboardRankingSystem>({
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
      select: {
        user: true,
        ...leaderboardFields,
      },
      orderBy: rankingSystem === Rank.PPv2
        ? {
            pp: 'desc',
          }
        : rankingSystem === Rank.RankedScore
          ? {
              [Rank.RankedScore]: 'desc',
            }
          : rankingSystem === Rank.TotalScore
            ? {
                [Rank.TotalScore]: 'desc',
              }
            : {},
      skip: start,
      take: pageSize,
    })

    return result.map(({ user, ...stat }, index) => ({
      user: toUserEssential(user, this.config),
      inThisLeaderboard: {
        [Rank.PPv2]: stat.pp,
        [Rank.RankedScore]: stat[Rank.RankedScore],
        [Rank.TotalScore]: stat[Rank.TotalScore],
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
        mode = Mode.Osu
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
    else if (rankingSystem === Rank.PPv2) {
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
      user: toUserEssential(item.user, this.config),
      score: {
        id: item.id.toString(),
        [Rank.PPv2]: item.pp,
        accuracy: item.acc,
        score: item.score,
        playedAt: item.playTime,
        mods: toMods(item.mods),
      },
      rank: index,
    }))
  }
}

export class RedisLeaderboardProvider extends LeaderboardDatabaseProvider {
  redisClient = redisClient()

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

  async getLeaderboard<M extends ActiveMode, RS extends LeaderboardRankingSystem>(opt: {
    mode: M
    ruleset: AvailableRuleset<M>
    rankingSystem: RS
    page: number
    pageSize: number
  }) {
    const { mode, ruleset, rankingSystem, page, pageSize } = opt

    const start = page * pageSize
    if (
      this.redisClient.isReady
      && rankingSystem === Rank.PPv2
    ) {
      try {
        const result: {
          id: number
          name: string
          safeName: string
          flag: CountryCode
          priv: number
          _rank: bigint
          accuracy: number
          [Rank.TotalScore]: bigint
          [Rank.RankedScore]: bigint
          [Rank.PPv2]: number
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
            flag: toCountryCode(user.country),
            [Rank.PPv2]: stat.pp,
            [Rank.TotalScore]: stat[Rank.TotalScore],
            [Rank.RankedScore]: stat[Rank.RankedScore],
            priv: user.priv,
            _rank: BigInt(start + Number.parseInt(index) + 1),
            accuracy: stat.accuracy,
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
            avatarSrc: (this.config.avatar.domain && `https://${this.config.avatar.domain}/${item.id}`) || undefined,
            roles: toRoles(item.priv),
          },
          inThisLeaderboard: {
            [Rank.PPv2]: item[Rank.PPv2],
            [Rank.TotalScore]: item[Rank.TotalScore],
            [Rank.RankedScore]: item[Rank.RankedScore],
            accuracy: item.accuracy,
            playCount: item.playCount,
            // rank: item._rank,
            // order is correct but rank contains banned user, since we didn't check user priv before when selecting count.
            // calculate rank based on page size * index of this page.
            rank: BigInt(start + index + 1),
          },
        }))
      }
      catch (e) {
        logger.error(e)
        return super.getLeaderboard(opt)
      }
    }
    else {
      return super.getLeaderboard(opt)
    }
  }
}

function create() {
  switch (env.LEADERBOARD_SOURCE) {
    case 'database': {
      return LeaderboardDatabaseProvider
    }
    case 'redis': {
      return RedisLeaderboardProvider
    }
  }
}

export const LeaderboardProvider = create()
