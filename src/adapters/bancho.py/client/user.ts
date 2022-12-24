import type { JSONContent } from '@tiptap/core'
import bcrypt from 'bcryptjs'
import { createClient } from 'redis'
import { TRPCError } from '@trpc/server'
import { generateHTML } from '@tiptap/html'
import type { Prisma, PrismaClient } from '@prisma/client' // bancho.py
import type { Id } from '../config'
import { BanchoPyMode, toBanchoPyMode } from '../enums'
import { createRulesetData, toFullUser, toUserEssential } from '../transforms'
import { toRankingSystemScores } from '../transforms/scores'
import { createUserQuery } from '../transforms/db-queries'
import { idToString, stringToId } from '../transforms/id-conversion'
import BanchoPyUserRelationship from './user-relations'
import { prismaClient } from '.'
import type { UserDataProvider } from '$def/client/user'
import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'
import useEditorExtensions from '~/composables/useEditorExtensions'

import type {
  UserEssential,
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
        idToString(id),
      ),
      countryRank: await redisClient.zRevRank(
        `bancho:leaderboard:${mode}:${country}`,
        idToString(id),
      ),
    }
  }
}

const TSFilter = <T>(item: T): item is Exclude<T, undefined> => item !== undefined

export default class BanchoPyUser implements UserDataProvider<Id> {
  db: PrismaClient

  relationships: BanchoPyUserRelationship

  constructor() {
    this.db = prismaClient
    this.relationships = new BanchoPyUserRelationship()
  }

  async exists({ handle, keys }: UserDataProvider.OptType<number, Record<never, never>>) {
    return (await this.db.user.count(createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']))) > 0
  }

  async getEssentialById<Includes extends Partial<Record<keyof UserOptional<unknown>, boolean>>>({ id, includes }: { id: Id; includes?: Includes }) {
    const user = await this.db.user.findFirst(
      {
        where: {
          id,
        },
      },
    )
    if (user == null)
      return null

    return toUserEssential({ user, includes })
  }

  async getEssential<Includes extends Partial<Record<keyof UserOptional<unknown>, boolean>>>(opt: UserDataProvider.OptType<Id, Includes>) {
    const { handle, includes, keys } = opt
    const user = await this.db.user.findFirst(
      createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']),
    )
    if (user == null)
      return null

    return toUserEssential({ user, includes })
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
    rankingSystem: OverallLeaderboardRankingSystem
    page: number
    perPage: number
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
    return toRankingSystemScores({ scores, rankingSystem, mode }).map(score => Object.assign(score, {
      id: score.id.toString(),
    }))
  }

  async getStatistics({
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

    const statistics: UserStatistic<Id, Mode, Ruleset, OverallLeaderboardRankingSystem> = {
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

  async getFull<Excludes extends Partial<Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>>>({ handle, excludes }: { handle: string; excludes?: Excludes }) {
    if (!excludes)
      excludes = <Excludes>{ secrets: true }
    const user = await this.db.user.findFirst(createUserQuery(handle))

    if (user == null)
      return null

    // type check will not find any missing params here.
    const returnValue = <Exclude<Awaited<ReturnType<UserDataProvider<Id>['getFull']>>, null>>(await toFullUser(user))
    const parallels: Promise<any>[] = []

    returnValue.reachable = false
    returnValue.status = 'offline'

    if (excludes.statistics !== true) {
      parallels.push(this.getStatistics(user).then((res) => {
        returnValue.statistics = res
      }))
    }
    if (excludes.relationships !== true) {
      parallels.push(this.relationships.get({ user }).then((res) => {
        returnValue.relationships = res
      }))
    }
    if (excludes.email !== true)
      returnValue.email = user.email

    if (excludes.profile !== true) {
      returnValue.profile = {
        html: user.userpageContent || '',
        raw: undefined,
      }
    }

    if (excludes.secrets === false) {
      returnValue.secrets = {
        password: user.pwBcrypt,
        apiKey: user.apiKey ?? undefined,
      }
    }

    await Promise.all(parallels)
    return returnValue
  }

  async changeSettings(
    user: UserEssential<Id>,
    input: {
      email?: string
      name?: string
    },
  ) {
    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: input.email,
        name: input.name,
      },
    })
    return toUserEssential({ user: result })
  }

  async changeUserpage(
    user: UserEssential<Id>,
    input: {
      profile: JSONContent
    },
  ) {
    const renderExtensions = useEditorExtensions()
    try {
      const html = generateHTML(input.profile, renderExtensions)
      const result = await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          userpageContent: html,
        },
      })
      return {
        html: result.userpageContent || '',
        raw: input.profile,
      }
    }
    catch (err) {
      throw new TRPCError({ code: 'PARSE_ERROR', message: 'unable to parse json content' })
    }
  }

  async changePassword(
    user: UserEssential<Id>,
    newPasswordMD5: string,
  ) {
    const salt = await bcrypt.genSalt(11)
    const pwBcrypt = await bcrypt.hash(newPasswordMD5, salt)
    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        pwBcrypt,
      },
    })
    return toUserEssential({ user: result })
  }

  async search({ keyword, limit }: { keyword: string; limit: number }) {
    const idKw = stringToId(keyword)
    const result = await this.db.user.findMany({
      where: {
        OR: [
          isNaN(idKw)
            ? undefined
            : {
                id: idKw,
              },
          {
            name: {
              contains: keyword,
            },
          },
          {
            safeName: {
              contains: keyword,
            },
          },
          keyword.startsWith('@')
            ? {
                safeName: {
                  contains: keyword.slice(1),
                },
              }
            : undefined,
          // TODO: search by email after preferences implemented
          // {
          //   email: {
          //     contains: keyword,
          //   },
          // },
        ].filter(TSFilter),
      },
      take: limit,
    })

    return result.map(user => toUserEssential({ user }))
  }
}
