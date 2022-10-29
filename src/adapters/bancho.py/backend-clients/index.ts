import {
  PrismaClient,
  Stat,
  User as DatabaseUser,
  RelationshipType
} from '@prisma/client'

import { createClient } from 'redis'

import type { AvailableRankingSystems, IdType as Id } from '../config'
import { toRoles, BanchoPyMode } from './enums'
import {
  BaseUser,
  User,
  UserModeRulesetStatistics
} from '~/prototyping/types/user'
import { Mode, Ruleset } from '~/prototyping/types/shared'

export const prismaClient = new PrismaClient()
const redisClient = Boolean(process.env.REDIS_URI) && createClient({
  url: process.env.REDIS_URI
})

const toBaseUser = (user: DatabaseUser): BaseUser<Id> => ({
  id: user.id,
  ingameId: user.id,
  name: user.name,
  safeName: user.safeName,
  email: user.email,
  flag: user.country,
  avatarUrl: '/images/1.png',
  roles: toRoles(user.priv)
})

export const getBaseUser = async (
  handle: string | Id
): Promise<BaseUser<Id> | null> => {
  let _handle = handle
  if (typeof _handle === 'string') {
    _handle = parseInt(_handle)
  }
  const query = {
    where: {
      AND: [
        {
          OR: [
            {
              id: _handle
            },
            {
              name: handle.toString()
            },
            {
              safeName: handle.toString()
            }
          ]
        },
        {
          priv: {
            gte: 1
          }
        }
      ]
    }
  }
  const user = await prismaClient.user.findFirst(query)

  if (!user) {
    return null
  }

  return toBaseUser(user)
}

const createRulesetData = (
  databaseResult: Stat | undefined,
  ranks:
    | {
        ppv2Rank: number | bigint;
        totalScoreRank: number | bigint;
        rankedScoreRank: number | bigint;
      }
    | undefined,
  livePPRank: {
    rank: number | null,
    countryRank: number | null
  } | false
): UserModeRulesetStatistics<AvailableRankingSystems> => {
  if (!databaseResult) {
    return {
      ranking: {
        ppv2: {
          rank: 0,
          performance: 0
        },
        rankedScore: {
          rank: 0,
          score: BigInt(0)
        },
        totalScore: {
          rank: 0,
          score: BigInt(0)
        }
      },
      playCount: 0,
      playTime: 0,
      totalHits: 0
    }
  }
  return {
    ranking: {
      ppv2: {
        rank: (livePPRank !== false && livePPRank.rank) || (ranks && Number(ranks.ppv2Rank)),
        countryRank: (livePPRank !== false && livePPRank.countryRank) || undefined,
        performance: databaseResult.pp
      },
      rankedScore: {
        rank: ranks && Number(ranks.rankedScoreRank),
        score: databaseResult.rankedScore
      },
      totalScore: {
        rank: ranks && Number(ranks.totalScoreRank),
        score: databaseResult.totalScore
      }
    },
    playCount: databaseResult.plays,
    playTime: databaseResult.playTime,
    totalHits: databaseResult.totalHits
  }
}
const getLiveRank = async (id: number, mode: number, country: string) => redisClient && ({
  rank: await redisClient.zRevRank(`bancho:leaderboard:${mode}`, id.toString()),
  countryRank: await redisClient.zRevRank(`bancho:leaderboard:${mode}:${country}`, id.toString())
})

export const getStatisticsOfUser = async ({ id, country }: { id: Id, country: string }) => {
  const [results, ranks, livePPRank] = await Promise.all([
    prismaClient.stat.findMany({
      where: {
        id
      }
    }),

    prismaClient.$queryRaw<
      Array<{
        id: Id;
        mode: number;
        ppv2Rank: bigint;
        totalScoreRank: bigint;
        rankedScoreRank: bigint;
      }>
    >/* sql */`
  WITH ranks AS (
    SELECT
      id,
      mode,
      RANK () OVER (
        PARTITION BY mode
        ORDER BY pp desc
      ) ppv2Rank,
      RANK () OVER (
        PARTITION BY mode
        ORDER BY tscore desc
      ) totalScoreRank,
      RANK () OVER (
        PARTITION BY mode
        ORDER BY rscore desc
      ) rankedScoreRank
    FROM stats
  )
  SELECT * FROM ranks
  WHERE id = ${id}
  `,

    redisClient && {
      osu: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
        relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
        autopuilot: await getLiveRank(id, BanchoPyMode.osuAutopilot, country)
      },
      taiko: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
        relax: await getLiveRank(id, BanchoPyMode.osuRelax, country)
      },
      fruits: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
        relax: await getLiveRank(id, BanchoPyMode.osuRelax, country)
      },
      mania: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country)
      }
    }
  ])

  const statistics: User<
    Id,
    false,
    Mode,
    Ruleset,
    AvailableRankingSystems
  >['statistics'] = {
    osu: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.osuStandard),
        ranks.find(i => i.mode === BanchoPyMode.osuStandard),
        livePPRank && livePPRank.osu.standard
      ),
      relax: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.osuRelax),
        ranks.find(i => i.mode === BanchoPyMode.osuRelax),
        livePPRank && livePPRank.osu.relax
      ),
      autopilot: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.osuAutopilot),
        ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
        livePPRank && livePPRank.osu.autopuilot
      )
    },
    taiko: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.taikoStandard),
        ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
        livePPRank && livePPRank.taiko.standard
      ),
      relax: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.taikoRelax),
        ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
        livePPRank && livePPRank.taiko.relax
      )
    },
    fruits: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.fruitsStandard),
        ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
        livePPRank && livePPRank.fruits.standard
      ),
      relax: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.fruitsRelax),
        ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
        livePPRank && livePPRank.fruits.relax
      )
    },
    mania: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.maniaStandard),
        ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
        livePPRank && livePPRank.mania.standard
      )
    }
  }
  return statistics
}

export const getFullUser = async <HasSecrets extends boolean>(
  handle: string | Id,
  secrets: HasSecrets
): Promise<User<Id, HasSecrets> | null> => {
  let _handle = handle
  if (typeof _handle === 'string') {
    _handle = parseInt(_handle)
  }
  const user = await prismaClient.user.findFirst({
    where: {
      AND: [
        {
          OR: [
            {
              id: _handle
            },
            {
              name: handle.toString()
            },
            {
              safeName: handle.toString()
            }
          ]
        },
        {
          priv: {
            gte: 1
          }
        }
      ]
    },
    include: {
      relations: {
        where: {
          type: RelationshipType.friend
        },
        include: {
          toUser: true
        }
      }
    }
  })

  if (!user) {
    return null
  }
  try {
    const returnValue: User<Id, false> = {
      id: user.id,
      ingameId: user.id,
      name: user.name,
      safeName: user.safeName,
      email: user.email,
      flag: user.country,
      avatarUrl: '/images/1.png',
      roles: toRoles(user.priv),
      statistics: await getStatisticsOfUser(user),
      preferences: {
        allowPrivateMessage: true,
        visibility: {
          email: 'nobody',
          oldNames: 'public'
        }
      },
      // TODO: get user reachable status
      reachable: false,
      // TODO: get user status
      status: 'website-online',
      oldNames: [],
      profile: (user.userpageContent && JSON.parse(user.userpageContent)) || {
        type: 'doc',
        content: []
      },
      friends: user.relations.map(relationship =>
        toBaseUser(relationship.toUser)
      )
    }

    if (secrets === true) {
      const _returnValue = {
        ...returnValue,
        secrets: {
          password: '',
          apiKey: ''
        }
      } as User<Id, true>
      return _returnValue
    } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      return returnValue
    }
  } catch (err) {
    console.error(err)
    return null
  }
}
