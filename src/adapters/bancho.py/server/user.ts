import { mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve, sep } from 'node:path'
import { TRPCError } from '@trpc/server'

import { glob } from 'glob'
import imageType from 'image-type'
import type { Prisma } from '.prisma/bancho.py'
import type { JSONContent } from '@tiptap/core'
import { BanchoPyMode } from '../enums'
import {
  createRulesetData,
  createUserQuery,
  fromRankingStatus,
  idToString,

  stringToId,

  toBanchoPyMode,
  toFullUser,
  toRankingSystemScores,
  toUserEssential, userEssentials,
} from '../transforms'
import type { Id } from '..'
import { getLiveUserStatus } from '../api-client'
import { encrypt } from '../crypto'
import { client as redisClient } from './source/redis'
import { getPrismaClient } from './source/prisma'
import { UserRelationProvider } from './user-relations'
import { ArticleProvider } from './article'
import { userNotFound } from '~/server/trpc/messages'

import { RankingStatusEnum } from '~/types/beatmap'
import { TSFilter } from '~/utils'

import type { UserProvider as Base } from '~/adapters/base/server'
import type { LeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'

import type { UserEssential, UserOptional, UserStatistic } from '~/types/user'

const article = new ArticleProvider()
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

const bpyNumModes = Object.values(BanchoPyMode).filter(v => !isNaN(Number(v))) as BanchoPyMode[]

export class UserProvider implements Base<Id> {
  static stringToId = stringToId
  static idToString = idToString
  db = getPrismaClient()

  relationships: UserRelationProvider
  redisClient?: ReturnType<typeof redisClient>

  config = {
    avatar: {
      domain: process.env.AVATAR_DOMAIN,
      location: process.env.BANCHO_PY_AVATAR_LOCATION,
    },
  }

  constructor() {
    this.db = getPrismaClient()
    this.relationships = new UserRelationProvider()
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
          idToString(id)
        ),
        countryRank: await this.redisClient.zRevRank(
          `bancho:leaderboard:${mode}:${country}`,
          idToString(id)
        ),
      }
    }
  }

  async exists({
    handle,
    keys,
  }: Base.OptType<number, Record<never, never>>) {
    return (
      (await this.db.user.count(
        createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email'])
      )) > 0
    )
  }

  async getEssentialById<
    Includes extends Partial<Record<keyof UserOptional<unknown>, boolean>>,
  >({ id, includes }: { id: Id; includes?: Includes }) {
    /* optimized */
    const user = await this.db.user.findFirstOrThrow({
      where: {
        id,
      },
      ...userEssentials,
    })

    return toUserEssential({ user, includes, config: this.config })
  }

  async getEssential<
    Includes extends Partial<Record<keyof UserOptional<unknown>, boolean>>,
  >(opt: Base.OptType<Id, Includes>) {
    const { handle, includes, keys } = opt
    /* optimized */
    const user = await this.db.user.findFirstOrThrow({
      ...createUserQuery(handle, keys || ['id', 'name', 'safeName', 'email']),
      ...userEssentials,
    })
      .catch(() => {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      })
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
  }: Base.BaseQuery<Id, Mode, Ruleset, _RS>) {
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
      })
    )
  }

  // https://github.com/prisma/prisma/issues/6570 need two separate query to get count for now
  async getTops<_RS extends LeaderboardRankingSystem>(opt: Base.BaseQuery<Id, Mode, Ruleset, _RS>) {
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
        ruleset
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
        ruleset
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
          })
      ),
    }
  }

  async getStatistics(opt: { id: Id; country: string }) {
    const { id } = opt
    const results = await this.db.stat.findMany({
      where: {
        id,
      },
    })

    const baseQuery = {
      user: {
        priv: {
          gt: 2,
        },
      },
    }
    const ranks = await Promise.all(results.map(async (stat) => {
      const [ppv2, rankedScore, totalScore] = await Promise.all([
        this.db.stat.count({
          where: {
            ...baseQuery,
            mode: stat.mode,
            pp: {
              gt: stat.pp,
            },
          },
        }),
        this.db.stat.count({
          where: {
            ...baseQuery,
            mode: stat.mode,
            rankedScore: {
              gt: stat.rankedScore,
            },
          },
        }),
        this.db.stat.count({
          where: {
            ...baseQuery,
            mode: stat.mode,
            totalScore: {
              gt: stat.totalScore,
            },
          },
        }),
      ])

      return {
        mode: stat.mode,
        ppv2Rank: ppv2 + 1,
        rankedScoreRank: rankedScore + 1,
        totalScoreRank: totalScore + 1,
      }
    }))
    const livePPRank = await this.getRedisRanks(opt)

    const statistics: UserStatistic<
      Mode,
      Ruleset,
      LeaderboardRankingSystem
    > = {
      osu: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuStandard
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
            i => i.mode === BanchoPyMode.osuAutopilot
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
          livePPRank: livePPRank?.osu.autopilot,
        }),
      },
      taiko: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoStandard
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
          livePPRank: livePPRank?.taiko.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoRelax
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
          livePPRank: livePPRank?.taiko.relax,
        }),
      },
      fruits: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsStandard
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
          livePPRank: livePPRank?.fruits.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsRelax
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
          livePPRank: livePPRank?.fruits.relax,
        }),
      },
      mania: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.maniaStandard
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
          livePPRank: livePPRank?.mania.standard,
        }),
      },
    }
    return statistics
  }

  async getRedisRanks({ id, country }: { id: Id; country: string }) {
    if (!this.redisClient) {
      return undefined
    }
    return {
      osu: {
        standard: await this.getLiveRank(
          id,
          BanchoPyMode.osuStandard,
          country
        ),
        relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
        autopilot: await this.getLiveRank(
          id,
          BanchoPyMode.osuAutopilot,
          country
        ),
      },
      taiko: {
        standard: await this.getLiveRank(
          id,
          BanchoPyMode.osuStandard,
          country
        ),
        relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
      },
      fruits: {
        standard: await this.getLiveRank(
          id,
          BanchoPyMode.osuStandard,
          country
        ),
        relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
      },
      mania: {
        standard: await this.getLiveRank(
          id,
          BanchoPyMode.osuStandard,
          country
        ),
      },
    }
  }

  async getFull<
    Excludes extends Partial<
      Record<keyof Base.ComposableProperties<Id>, boolean>
    >,
  >({ handle, excludes }: { handle: string; excludes?: Excludes }) {
    if (!excludes) {
      excludes = <Excludes>{ secrets: true }
    }
    const user = await this.db.user.findFirstOrThrow(createUserQuery(handle))

    // type check will not find any missing params here.
    const returnValue = <
      Exclude<Awaited<ReturnType<Base<Id>['getFull']>>, null>
      > await toFullUser(user, this.config)
    const parallels: Promise<any>[] = []

    returnValue.reachable = false
    returnValue.status = 'offline'

    if (excludes.statistics !== true) {
      parallels.push(
        this.getStatistics(user).then((res) => {
          returnValue.statistics = res
        })
      )
    }
    if (excludes.relationships !== true) {
      parallels.push(
        this.relationships.get({ user }).then((res) => {
          returnValue.relationships = res
        })
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
      .catch((e) => {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message })
      })
    return returnValue
  }

  async changeSettings(
    user: UserEssential<Id>,
    input: {
      email?: string
      name?: string
    }
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
    }
  ) {
    const html = article.render(input.profile)
    try {
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
    const pwBcrypt = await encrypt(newPasswordMD5)
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

    const oldFilesPath = `${user.id}.*`

    if (oldFilesPath.startsWith('.')) {
      throw new TRPCError({
        message: 'SOMEONE IS TRYING TO DELETE ALL AVATARS',
        code: 'BAD_REQUEST',
      })
    }
    const existFilesPath = join(this.config.avatar.location, oldFilesPath)
    const loc = join(this.config.avatar.location, `${user.id}.${mime.ext}`)

    const oldFiles = await glob(existFilesPath)

    if (oldFiles.length > 2) {
      throw new TRPCError({
        message: 'trying to delete more than 2 files, please contact support to clean your old avatars',
        code: 'INTERNAL_SERVER_ERROR',
      })
    }

    await Promise.all(oldFiles.map(file => unlink(file)))

    await writeFile(loc, avatar)
    return `//${this.config.avatar.domain}/${user.id}?${Date.now()}`
  }

  async search({ keyword, limit }: { keyword: string; limit: number }) {
    const idKw = stringToId(keyword)
    /* optimized */
    const result = await this.db.user.findMany({
      ...userEssentials,
      where: {
        OR: [
          keyword.startsWith('@')
            ? {
                safeName: {
                  contains: keyword.slice(1),
                },
              }
            : undefined,
          {
            safeName: {
              contains: keyword,
            },
          },
          {
            name: {
              contains: keyword,
            },
          },
          isNaN(idKw)
            ? undefined
            : {
                id: idKw,
              },
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

  async count() {
    /* optimized */
    return await this.db.user.count({
      where: {
        priv: {
          gte: 2,
        },
      },
    })
  }

  status(opt: { id: Id }) {
    return getLiveUserStatus(opt)
  }

  async register(opt: { name: string; safeName: string; email: string; passwordMd5: string }) {
    const { name, safeName, email, passwordMd5 } = opt

    const user = await this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          safeName,
          email,
          pwBcrypt: await encrypt(passwordMd5),
        },
      })

      await this.db.stat.createMany({
        data: bpyNumModes.map(mode => ({
          id: user.id,
          mode,
        })),
      })
      return user
    })

    return toUserEssential({ user, config: this.config })
  }
}
