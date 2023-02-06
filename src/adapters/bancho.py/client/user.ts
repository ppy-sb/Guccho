import { isAbsolute, join, resolve, sep } from 'path'
import { mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import type { Prisma, PrismaClient } from '.prisma/bancho.py'
import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import imageType from 'image-type'
import { BanchoPyMode, toBanchoPyMode } from '../enums'
import type { Id } from '../exports'
import { client as redisClient } from '../redis-client'
import { createRulesetData, fromRankingStatus, toFullUser, toUserEssential } from '../transforms'
import { createUserQuery } from '../transforms/db-queries'
import { idToString, stringToId } from '../transforms/id-conversion'
import { toRankingSystemScores } from '../transforms/scores'
import BanchoPyUserRelationship from './user-relations'
import { prismaClient } from '.'
import type { LeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'
import useEditorExtensions from '~/composables/useEditorExtensions'
import type { UserDataProvider } from '$def/client/user'

import type { UserEssential, UserOptional, UserStatistic } from '~/types/user'

import { RankingStatusEnum } from '~/types/beatmap'
import { TSFilter } from '~/utils'

function mkDirByPathSync(targetDir: string, { isRelativeToScript = false } = {}) {
  const initDir = isAbsolute(targetDir) ? sep : ''
  const baseDir = isRelativeToScript ? __dirname : '.'

  return targetDir.split(sep).reduce((parentDir: string, childDir: string) => {
    const curDir = resolve(baseDir, parentDir, childDir)
    try {
      mkdirSync(curDir)
    }
    catch (err: any) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`)
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].includes(err.code)
      if (!caughtErr || (caughtErr && curDir === resolve(targetDir))) {
        throw err // Throw if it's just the last created dir.
      }
    }

    return curDir
  }, initDir)
}

export default class BanchoPyUser implements UserDataProvider<Id> {
  db: PrismaClient

  relationships: BanchoPyUserRelationship
  redisClient?: ReturnType<typeof redisClient>

  config = {
    avatar: {
      domain: process.env.BANCHO_PY_AVATAR_DOMAIN,
      location: process.env.BANCHO_PY_AVATAR_LOCATION,
    },
  }

  constructor() {
    this.db = prismaClient
    this.relationships = new BanchoPyUserRelationship()
    this.redisClient = redisClient()

    if (this.config.avatar.location) {
      mkDirByPathSync(this.config.avatar.location)
    }
  }

  async getLiveRank(id: number, mode: number, country: string) {
    if (this.redisClient?.isReady) {
      return {
        rank: await this.redisClient.zRevRank(
          `bancho:leaderboard:${mode}`,
          idToString(id),
        ),
        countryRank: await this.redisClient.zRevRank(
          `bancho:leaderboard:${mode}:${country}`,
          idToString(id),
        ),
      }
    }
  }

  async exists({
    handle,
    keys,
  }: UserDataProvider.OptType<number, Record<never, never>>) {
    return (
      (await this.db.user.count(
        createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']),
      )) > 0
    )
  }

  async getEssentialById<
    Includes extends Partial<Record<keyof UserOptional<unknown>, boolean>>,
  >({ id, includes }: { id: Id; includes?: Includes }) {
    const user = await this.db.user.findFirst({
      where: {
        id,
      },
    })
    if (user == null) {
      return null
    }

    return toUserEssential({ user, includes, config: this.config })
  }

  async getEssential<
    Includes extends Partial<Record<keyof UserOptional<unknown>, boolean>>,
  >(opt: UserDataProvider.OptType<Id, Includes>) {
    const { handle, includes, keys } = opt
    const user = await this.db.user.findFirst(
      createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']),
    )
    if (user == null) {
      return null
    }

    return toUserEssential({ user, includes, config: this.config })
  }

  // https://github.com/prisma/prisma/issues/6570 need two separate query to get count for now
  async getBests<_RS extends LeaderboardRankingSystem>({
    id,
    mode,
    ruleset,
    rankingSystem,
    page,
    perPage,
    rankingStatus,
  }: UserDataProvider.BaseQuery<Id, Mode, Ruleset, _RS>) {
    const start = page * perPage
    const _mode = toBanchoPyMode(mode, ruleset)
    if (_mode === undefined) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'unsupported mode',
      })
    }
    const banchoPyRankingStatus = rankingStatus.map(i => fromRankingStatus(RankingStatusEnum[i]))

    const orderBy: Prisma.ScoreFindManyArgs['orderBy'] = {}
    if (rankingSystem === 'ppv2') {
      orderBy.pp = 'desc'
    }
    else if (rankingSystem === 'rankedScore') {
      orderBy.score = 'desc'
    }
    else if (rankingSystem === 'totalScore') {
      orderBy.score = 'desc'
    }
    else {
      throw new Error('unknown ranking system')
    }
    const scores = await this.db.score.findMany({
      where: {
        userId: id,
        mode: _mode,
        status: {
          // TODO remove unranked map from user bests
          in: banchoPyRankingStatus,
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
    return toRankingSystemScores({ scores, rankingSystem, mode }).map(score =>
      Object.assign(score, {
        id: score.id.toString(),
      }),
    )
  }

  // https://github.com/prisma/prisma/issues/6570 need two separate query to get count for now
  async getTops<_RS extends LeaderboardRankingSystem>(opt: UserDataProvider.BaseQuery<Id, Mode, Ruleset, _RS>) {
    const { id, mode, ruleset, rankingSystem, page, perPage, rankingStatus } = opt

    const start = page * perPage

    const banchoPyRankingStatus = rankingStatus.map(i => fromRankingStatus(RankingStatusEnum[i]))

    let scoreIds: number[]
    if (rankingSystem === 'rankedScore' || rankingSystem === 'totalScore') {
      scoreIds = await this.db.$queryRaw<{ id: string }[]>`
SELECT s2.id
FROM scores s2
INNER JOIN (
  SELECT s.map_md5 AS md5, MAX(s.score) AS maxScore
  FROM users u
  INNER JOIN scores s ON s.userid = u.id
  WHERE u.priv > 2 AND s.mode = ${toBanchoPyMode(
    mode,
    ruleset,
  )} AND s.score > 0 AND s.status in (${banchoPyRankingStatus.join(',')})
  GROUP BY s.map_md5
) tmp ON tmp.maxScore = s2.score AND tmp.md5 = s2.map_md5
WHERE s2.userid = ${id}
`.then(res => res.map(res => parseInt(res.id)))
    }
    else if (rankingSystem === 'ppv2') {
      scoreIds = await this.db.$queryRaw<{ id: string }[]>`
SELECT s2.id
FROM scores AS s2
INNER JOIN (
    SELECT s.map_md5 AS md5, MAX(s.pp) AS maxPP
    FROM users AS u
    INNER JOIN scores AS s ON s.userid = u.id
    WHERE u.priv > 2 AND s.mode = ${toBanchoPyMode(
      mode,
      ruleset,
    )} AND s.pp > 0 AND s.status in (${banchoPyRankingStatus.join(',')})
    GROUP BY s.map_md5
) AS tmp ON tmp.maxPP = s2.pp AND tmp.md5 = s2.map_md5
WHERE s2.userid = ${id}
`.then(res => res.map(res => parseInt(res.id)))
    }
    else {
      return {
        count: 0,
        scores: [],
      }
    }
    const scores = await this.db.score.findMany({
      where: {
        id: {
          in: scoreIds,
        },
      },
      include: {
        beatmap: {
          include: {
            source: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
      skip: start,
      take: perPage,
    })
    return {
      count: scoreIds.length,
      scores: toRankingSystemScores({ scores, rankingSystem, mode }).map(
        score =>
          Object.assign(score, {
            id: score.id.toString(),
          }),
      ),
    }
  }

  async getStatistics({ id, country }: { id: Id; country: string }) {
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
  `.catch(_ => []),

      this.redisClient
        ? {
            osu: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.osuStandard,
                country,
              ),
              relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
              autopilot: await this.getLiveRank(
                id,
                BanchoPyMode.osuAutopilot,
                country,
              ),
            },
            taiko: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.osuStandard,
                country,
              ),
              relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
            },
            fruits: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.osuStandard,
                country,
              ),
              relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
            },
            mania: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.osuStandard,
                country,
              ),
            },
          }
        : undefined,
    ])

    const statistics: UserStatistic<
      Mode,
      Ruleset,
      LeaderboardRankingSystem
    > = {
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
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoRelax,
          ),
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

  async getFull<
    Excludes extends Partial<
      Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>
    >,
  >({ handle, excludes }: { handle: string; excludes?: Excludes }) {
    if (!excludes) {
      excludes = <Excludes>{ secrets: true }
    }
    const user = await this.db.user.findFirst(createUserQuery(handle))

    if (user == null) {
      return null
    }

    // type check will not find any missing params here.
    const returnValue = <
      Exclude<Awaited<ReturnType<UserDataProvider<Id>['getFull']>>, null>
    > await toFullUser(user, this.config)
    const parallels: Promise<any>[] = []

    returnValue.reachable = false
    returnValue.status = 'offline'

    if (excludes.statistics !== true) {
      parallels.push(
        this.getStatistics(user).then((res) => {
          returnValue.statistics = res
        }),
      )
    }
    if (excludes.relationships !== true) {
      parallels.push(
        this.relationships.get({ user }).then((res) => {
          returnValue.relationships = res
        }),
      )
    }
    if (excludes.email !== true) {
      returnValue.email = user.email
    }

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
    return toUserEssential({ user: result, config: this.config })
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
      throw new TRPCError({
        code: 'PARSE_ERROR',
        message: 'unable to parse json content',
      })
    }
  }

  async changePassword(user: UserEssential<Id>, newPasswordMD5: string) {
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
    return toUserEssential({ user: result, config: this.config })
  }

  async changeAvatar(user: { id: Id }, avatar: Uint8Array) {
    if (!this.config.avatar.location) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'server is not configured correctly, missing avatar location',
      })
    }
    const mime = await imageType(avatar)

    if (!mime?.mime.includes('image')) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Not an image',
      })
    }

    const loc = join(this.config.avatar.location, `${user.id}.${mime.ext}`)
    await writeFile(loc, avatar)
    return `//${this.config.avatar.domain}/${user.id}?${Date.now()}`
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

    return result.map(user => toUserEssential({ user, config: this.config }))
  }
}
