import bcrypt from 'bcryptjs'
import { createClient } from 'redis'
import { TRPCError } from '@trpc/server'
import type { Prisma, PrismaClient } from '@prisma/client'
import type { IdType as Id } from '../config'
import { BanchoPyMode, toBanchoPyMode } from '../enums'
import { createRulesetData, toBaseUser, toFullUser } from '../transforms'
import { toRankingSystemScores } from '../transforms/scores'
import type { UserDataProvider } from '../../base/client/user'
import { createUserQuery } from './db-queries'
import { getRelationships } from './user-relations'
import { prismaClient } from './index'
import type { Mode, Range, RankingSystem, Ruleset } from '~/types/common'

import type {
  BaseUser,
  UserOptional,
  UserStatistic,
} from '~/types/user'

const redisClient
  = Boolean(process.env.REDIS_URI)
  && createClient({
    url: process.env.REDIS_URI,
  })

async function getLiveRank(id: number, mode: number, country: string) {
  if (redisClient) {
    return {
      rank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}`,
        id.toString(),
      ),
      countryRank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}:${country}`,
        id.toString(),
      ),
    }
  }
}

export default class BanchoPyUser implements UserDataProvider<Id> {
  db: PrismaClient = prismaClient

  async userExists({ handle, keys }: UserDataProvider.OptType<number, Record<never, never>>): Promise<boolean> {
    return (await this.db.user.count(createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']))) > 0
  }

  async getBaseUser<Includes extends Partial<Record<keyof UserOptional<number>, boolean>>>(opt: UserDataProvider.OptType<Id, Includes>): Promise<BaseUser<number> | null> {
    const { handle, includes, keys } = opt
    const user = await this.db.user.findFirst(
      createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']),
    )
    if (user == null)
      return null

    return toBaseUser({ user, includes })
  }

  async getBaseUsers<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: { handle: string | number; includes?: Includes | undefined }): Promise<BaseUser<number>[]> {
    const { handle, includes } = opt
    const users = await this.db.user.findMany(createUserQuery(handle))
    return users.map(user => toBaseUser({ user, includes }))
  }

  async getBests({
    id,
    mode,
    ruleset,
    rankingSystem,
    page,
    perPage,
  }: {
    id: Id
    mode: Mode
    ruleset: Ruleset
    rankingSystem: RankingSystem
    page: Range<0, 10>
    perPage: Range<1, 11>
  }) {
    const start = page * perPage
    const _mode = toBanchoPyMode(mode, ruleset)
    if (_mode === undefined)
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'unsupported mode' })

    const orderBy: Prisma.ScoreFindManyArgs['orderBy'] = {}
    if (rankingSystem === 'ppv2')
      orderBy.pp = 'desc'
    else if (rankingSystem === 'rankedScore')
      orderBy.score = 'desc'
    else if (rankingSystem === 'totalScore')
      orderBy.score = 'desc'
    const scores = await this.db.score.findMany({
      where: {
        userId: id,
        mode: _mode,
        status: {
          in: [2, 3],
        },
      },
      include: {
        beatmap: {
          include: {
            source: true,
          },
        },
      },
      orderBy,
      skip: start,
      take: perPage,
    })
    return toRankingSystemScores({ scores, rankingSystem, mode })
  }

  async getStatisticsOfUser({
    id,
    country,
  }: {
    id: Id
    country: string
  }) {
    const [results, ranks, livePPRank] = await Promise.all([
      this.db.stat.findMany({
        where: {
          id,
        },
      }),

      this.db.$queryRaw<
        Array<{
          id: Id
          mode: number
          ppv2Rank: bigint
          totalScoreRank: bigint
          rankedScoreRank: bigint
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
              autopilot: await getLiveRank(id, BanchoPyMode.osuAutopilot, country),
            },
            taiko: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
              relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
            },
            fruits: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
              relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
            },
            mania: {
              standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
            },
          }
        : undefined,
    ])

    const statistics: UserStatistic<Id, Mode, Ruleset, RankingSystem> = {
      osu: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuStandard),
          livePPRank: livePPRank?.osu.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(i => i.mode === BanchoPyMode.osuRelax),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuRelax),
          livePPRank: livePPRank?.osu.relax,
        }),
        autopilot: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuAutopilot,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
          livePPRank: livePPRank?.osu.autopilot,
        }),
      },
      taiko: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
          livePPRank: livePPRank?.taiko.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(i => i.mode === BanchoPyMode.taikoRelax),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
          livePPRank: livePPRank?.taiko.relax,
        }),
      },
      fruits: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
          livePPRank: livePPRank?.fruits.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsRelax,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
          livePPRank: livePPRank?.fruits.relax,
        }),
      },
      mania: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.maniaStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
          livePPRank: livePPRank?.mania.standard,
        }),
      },
    }
    return statistics
  }

  async getFullUser<Excludes extends Partial<Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>>>({ handle, excludes }: { handle: string | Id; excludes?: Excludes }) {
    if (!excludes)
      excludes = <Excludes>{ secrets: true }
    const user = await this.db.user.findFirst(createUserQuery(handle))

    if (user == null)
      return null

    const fullUser = await toFullUser(user)

    return {
      ...fullUser,
      reachable: false,
      status: 'offline' as const,
      statistics:
        (excludes.statistics === true
          ? undefined as never
          : await this.getStatisticsOfUser(user)),
      relationships:
        (excludes.relationships === true
          ? undefined as never
          : await getRelationships(user)),
      email: (excludes.email === true ? undefined as never : user.email),
      profile: (excludes.profile === true
        ? undefined as never
        : {
            html: user.userpageContent || '',
            // TODO: alter database to read/save raw
            raw: {},
          }),
      secrets: (excludes.secrets === false
        ? {
            password: user.pwBcrypt,
            apiKey: user.apiKey ?? undefined,
          }
        : undefined as never),
    }
  }

  async updateUser(
    user: BaseUser<Id>,
    input: {
      email?: string
      name?: string
      userpageContent?: string
    },
  ) {
    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: input.email,
        name: input.name,
        userpageContent: input.userpageContent,
      },
    })
    return toBaseUser({ user: result })
  }

  async updateUserPassword(
    user: BaseUser<Id>,
    newPasswordMD5: string,
  ) {
  // TODO: gen salt round
    const salt = await bcrypt.genSalt()
    const pwBcrypt = await bcrypt.hash(newPasswordMD5, salt)
    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        pwBcrypt,
      },
    })
    return toBaseUser({ user: result })
  }
}
