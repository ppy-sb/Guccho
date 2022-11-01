import {
  PrismaClient
} from '@prisma/client'
import { createClient } from 'redis'

import type { IdType as Id } from '../config'
import { BanchoPyMode } from './enums'
import { createUserQuery } from './queries'
import { createRulesetData, toBaseUser, toRoles } from './transforms'
import { getRelationships } from './user-relations'

import type { BaseUser, UserExtra, UserOptional, UserStatistic } from '~/prototyping/types/user'

const prismaClient = new PrismaClient()

const redisClient = Boolean(process.env.REDIS_URI) && createClient({
  url: process.env.REDIS_URI
})

export const getBaseUser = async <Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<never, never>>(
  handle: string | Id,
  includes?: Includes
) => {
  const user = await prismaClient.user.findFirst(createUserQuery(handle))
  if (!user) {
    return null
  }
  return toBaseUser(user, includes)
}

export const getBaseUsers = async <Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<never, never>>(
  handle: string | Id,
  includes?: Includes
) => {
  const users = await prismaClient.user.findMany(createUserQuery(handle))
  return users.map(user => toBaseUser(user, includes))
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
        autopilot: await getLiveRank(id, BanchoPyMode.osuAutopilot, country)
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

  const statistics: UserStatistic = {
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
        livePPRank && livePPRank.osu.autopilot
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

// high cost
export const getFullUser = async <Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<never, never>>(
  handle: string | Id,
  includes: Includes
) => {
  const user = await prismaClient.user.findFirst(createUserQuery(handle))

  if (!user) {
    return null
  }
  try {
    // dispatch queries for user data without waiting for results
    const pUserRelationships = getRelationships(user)
    const pUserStatistics = getStatisticsOfUser(user)

    const returnValue: BaseUser<Id> & Partial<UserOptional<Id>> & UserExtra<Id> = {
      id: user.id,
      ingameId: user.id,
      name: user.name,
      safeName: user.safeName,
      // email: includes?.email ? user.email : undefined,
      flag: user.country,
      avatarUrl: `https://a.ppy.sb/${user.id}`,
      roles: toRoles(user.priv),
      statistics: await pUserStatistics,
      preferences: {
        scope: {
          reachable: 'public',
          status: 'public',
          privateMessage: 'public',
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
      relationships: await pUserRelationships
    }

    if (includes.secrets) {
      returnValue.secrets = {
        password: user.pwBcrypt,
        apiKey: user.apiKey ?? undefined
      }
    }
    // not respecting preferences because bancho.py don't support preferences
    // if (returnValue.preferences.email || includes.email)
    if (includes.email) {
      returnValue.email = user.email
    }
    return returnValue
  } catch (err) {
    console.error(err)
    return null
  }
}