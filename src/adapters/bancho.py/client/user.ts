/* eslint-disable import/no-named-as-default-member */
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'

import { createClient } from 'redis'
import type { IdType as Id, Mode, RankingSystem, Ruleset } from '../config'
import { BanchoPyMode } from '../enums'
import { createRulesetData, toBaseUser, toFullUser } from '../transforms'
import { createUserQuery } from './db-queries'
import { getRelationships } from './user-relations'
import { prismaClient as db } from './index'

import type {
  BaseUser,
  UserExtra,
  UserOptional,
  UserStatistic
} from '~/types/user'

const redisClient =
  Boolean(process.env.REDIS_URI) &&
  createClient({
    url: process.env.REDIS_URI
  })
type OptType<
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
    never,
    never
  >
> = {
  handle: string | Id;
  includes?: Includes;
  keys?: Array<['id', 'name', 'safeName', 'email'][number]>;
};
export async function userExists ({ handle, keys }: OptType) {
  return (
    (await db.user.count(
      createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email'])
    )) > 0
  )
}

export async function getBaseUser<
  Includes extends Partial<Record<keyof UserOptional<number>, boolean>>
> (opt: OptType<Includes>) {
  const { handle, includes, keys } = opt
  const user = await db.user.findFirst(
    createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email'])
  )
  if (!user) {
    return null
  }
  return toBaseUser({ user, includes })
}

export async function getBaseUsers<
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>
> (opt: { handle: string | Id; includes?: Includes }) {
  const { handle, includes } = opt
  const users = await db.user.findMany(createUserQuery(handle))
  return users.map(user => toBaseUser({ user, includes }))
}

async function getLiveRank (id: number, mode: number, country: string) {
  if (redisClient) {
    return {
      rank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}`,
        id.toString()
      ),
      countryRank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}:${country}`,
        id.toString()
      )
    }
  }
}

export const getStatisticsOfUser = async ({
  id,
  country
}: {
  id: Id;
  country: string;
}) => {
  const [results, ranks, livePPRank] = await Promise.all([
    db.stat.findMany({
      where: {
        id
      }
    }),

    db.$queryRaw<
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

    redisClient
      ? {
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
      : undefined
  ])

  const statistics: UserStatistic<Id, Mode, Ruleset, RankingSystem> = {
    osu: {
      standard: createRulesetData({
        databaseResult: results.find(
          i => i.mode === BanchoPyMode.osuStandard
        ),
        ranks: ranks.find(i => i.mode === BanchoPyMode.osuStandard),
        livePPRank: livePPRank?.osu.standard
      }),
      relax: createRulesetData({
        databaseResult: results.find(i => i.mode === BanchoPyMode.osuRelax),
        ranks: ranks.find(i => i.mode === BanchoPyMode.osuRelax),
        livePPRank: livePPRank?.osu.relax
      }),
      autopilot: createRulesetData({
        databaseResult: results.find(
          i => i.mode === BanchoPyMode.osuAutopilot
        ),
        ranks: ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
        livePPRank: livePPRank?.osu.autopilot
      })
    },
    taiko: {
      standard: createRulesetData({
        databaseResult: results.find(
          i => i.mode === BanchoPyMode.taikoStandard
        ),
        ranks: ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
        livePPRank: livePPRank?.taiko.standard
      }),
      relax: createRulesetData({
        databaseResult: results.find(i => i.mode === BanchoPyMode.taikoRelax),
        ranks: ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
        livePPRank: livePPRank?.taiko.relax
      })
    },
    fruits: {
      standard: createRulesetData({
        databaseResult: results.find(
          i => i.mode === BanchoPyMode.fruitsStandard
        ),
        ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
        livePPRank: livePPRank?.fruits.standard
      }),
      relax: createRulesetData({
        databaseResult: results.find(
          i => i.mode === BanchoPyMode.fruitsRelax
        ),
        ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
        livePPRank: livePPRank?.fruits.relax
      })
    },
    mania: {
      standard: createRulesetData({
        databaseResult: results.find(
          i => i.mode === BanchoPyMode.maniaStandard
        ),
        ranks: ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
        livePPRank: livePPRank?.mania.standard
      })
    }
  }
  return statistics
}

// high cost
export async function getFullUser<
  Includes extends Partial<
    Record<keyof (UserExtra<Id> & UserOptional<Id>), boolean>
  > = Record<never, never>
> (opt: { handle: string | Id; includes: Includes }) {
  const { includes, handle } = opt
  const user = await db.user.findFirst(createUserQuery(handle))

  if (!user) {
    return null
  }
  return toFullUser<Mode, Ruleset, RankingSystem>({
    user,
    extraFields: {
      statistics:
          includes.statistics === false
            ? undefined
            : await getStatisticsOfUser(user),
      relationships:
          includes.relationships === false
            ? undefined
            : await getRelationships(user),
      secrets: includes.secrets
        ? {
            password: user.pwBcrypt,
            apiKey: user.apiKey ?? undefined
          }
        : undefined,
      email: includes.email ? user.email : undefined
    }
  }) as BaseUser<Id> & {
    [K in keyof (UserExtra<Id> & UserOptional<Id>) as Includes[K] extends false ? never : K]: (Required<UserOptional<Id>> & UserExtra<Id>)[K]
  }
}

export async function updateUser (
  user: BaseUser<Id>,
  input: { email?: string; name?: string }
) {
  const result = await db.user.update({
    where: {
      id: user.id
    },
    data: {
      email: input.email,
      name: input.name
    }
  })
  return toBaseUser({ user: result })
}

export async function updateUserPassword (
  user: BaseUser<Id>,
  newPasswordMD5: string
) {
  // TODO: gen salt round
  const salt = await bcrypt.genSalt()
  const pwBcrypt = await bcrypt.hash(newPasswordMD5, salt)
  const result = await db.user.update({
    where: {
      id: user.id
    },
    data: {
      pwBcrypt
    }
  })
  return toBaseUser({ user: result })
}
