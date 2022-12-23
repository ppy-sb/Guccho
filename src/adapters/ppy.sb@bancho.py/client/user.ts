import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { createClient } from 'redis'
import type { Prisma, PrismaClient } from '@prisma/client' // ppy.sb
import type { Id } from '../config'
import { prismaClient } from '.'
import { createRulesetData, toFullUser, toUserEssential } from '~/adapters/bancho.py/transforms'
import { createUserQuery } from '~/adapters/bancho.py/transforms/db-queries'
import BanchoPyUserRelationship from '~/adapters/bancho.py/client/user-relations'
import { BanchoPyMode, toBanchoPyMode } from '~/adapters/bancho.py/enums'
import { toRankingSystemScores } from '~/adapters/bancho.py/transforms/scores'
import useEditorExtensions from '~/composables/useEditorExtensions'
import type { UserDataProvider as Base } from '$def/client/user'

import type { UserEssential, UserOptional, UserStatistic } from '~/types/user'
import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'

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
export class UserDataProvider implements Base<Id> {
  db: PrismaClient
  relationships: BanchoPyUserRelationship

  constructor({ client }: { client: PrismaClient } = { client: prismaClient }) {
    this.db = client
    this.relationships = new BanchoPyUserRelationship()
  }

  async getFull<Excludes extends Partial<Record<keyof Base.ComposableProperties<Id>, boolean>>>({ handle, excludes }: { handle: string; excludes?: Excludes }) {
    if (!excludes)
      excludes = <Excludes>{ secrets: true }
    const user = await this.db.user.findFirst(createUserQuery(handle))

    if (user == null)
      return null

    const fullUser = toFullUser(user)
    const profile = await this.db.userpage.findFirst({
      where: {
        userId: user.id,
      },
    })

    // type check will not find any missing params here.
    const returnValue = <Exclude<Awaited<ReturnType<Base<Id>['getFull']>>, null>>fullUser
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
        html: profile?.html || '',
        raw: (profile?.raw && JSON.parse(profile.raw)) || undefined,
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

  async changeUserpage(user: UserEssential<number>, input: { profile: JSONContent }) {
    const renderExtensions = useEditorExtensions()
    try {
      const html = generateHTML(input.profile, renderExtensions)

      const userpage = await this.db.userpage.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
        },
      })
      if (!userpage) {
        const inserted = await this.db.userpage.create({
          data: {
            userId: user.id,
            html,
            raw: JSON.stringify(input.profile),
            rawType: 'tiptap',
          },
        })
        if (!inserted.id)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'unable to save' })

        return {
          html: inserted.html as string,
          raw: JSON.parse(inserted.raw ?? '') || {},
        }
      }
      else {
        const updated = await this.db.userpage.update({
          where: {
            id: userpage.id,
          },
          data: {
            html,
            raw: JSON.stringify(input.profile),
          },
        })
        return {
          html: updated.html as string,
          raw: JSON.parse(updated.raw ?? '') || {},
        }
      }
    }
    catch (err) {
      throw new TRPCError({ code: 'PARSE_ERROR', message: 'unable to parse json content' })
    }
  }

  async exists({ handle, keys }: Base.OptType<number, Record<never, never>>) {
    return (await this.db.user.count(createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']))) > 0
  }

  async getEssentialById<Includes extends Partial<Record<keyof UserOptional<number>, boolean>>>({ id, includes }: { id: Id; includes?: Includes }) {
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

  async getEssential<Includes extends Partial<Record<keyof UserOptional<number>, boolean>>>(opt: Base.OptType<Id, Includes>) {
    const { handle, includes, keys } = opt
    const user = await this.db.user.findFirst(
      createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']),
    )
    if (user == null)
      return null

    return toUserEssential({ user, includes })
  }

  async getEssentials<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: { handle: string; includes?: Includes | undefined }) {
    const { handle, includes } = opt
    const users = await this.db.user.findMany(createUserQuery(handle))
    return users.map(user => toUserEssential({ user, includes }))
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
    return toRankingSystemScores({ scores, rankingSystem, mode }).map(scores => ({
      ...scores,
      id: scores.id.toString(),
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

  async changePassword(
    user: UserEssential<Id>,
    newPasswordMD5: string,
  ) {
    const salt = await bcrypt.genSalt(10)
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
}
