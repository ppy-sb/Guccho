import { mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve, sep } from 'node:path'
import { merge } from 'lodash-es'
import imageType from 'image-type'
import { glob } from 'glob'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import { Prisma, type Stat } from 'prisma-client-bancho-py'
import type { Id } from '..'
import { getLiveUserStatus } from '../api-client'
import { normal } from '../constants'
import { encryptBanchoPassword } from '../crypto'
import {
  createUserHandleWhereQuery,
  createUserLikeQuery,
  userCompacts,
} from '../db-query'
import type { settings } from '../dynamic-settings'
import { BanchoPyMode, BanchoPyScoreStatus } from '../enums'
import { config } from '../env'
import { Logger } from '../log'
import {
  BPyMode,
  createRulesetData,
  fromCountryCode,
  fromRankingStatus,
  idToString,
  stringToId,

  toBanchoPyMode,
  toFullUser,
  toRankingSystemScores,
  toSafeName,
  toUserCompact,
} from '../transforms'
import { ArticleProvider } from './article'
import { ScoreProvider } from './score'
import { getPrismaClient } from './source/prisma'
import { client as redisClient } from './source/redis'
import { UserRelationProvider } from './user-relations'
import { oldPasswordMismatch, passwordMismatch, userNotFound } from '~/server/trpc/messages'
import { type DynamicSettingStore, Scope, type UserCompact, type UserStatistic, UserStatus } from '~/def/user'
import type { CountryCode } from '~/def/country-code'
import type { ActiveMode, ActiveRuleset, LeaderboardRankingSystem } from '~/def/common'
import { Mode, Rank, Ruleset } from '~/def'
import { UserProvider as Base } from '$base/server'
import type { ExtractLocationSettings, ExtractSettingType } from '$base/@define-setting'

const { compare } = bcrypt

type ServerSetting = ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>

const logger = Logger.child({ label: 'user' })

function ensureDirectorySync(targetDir: string, { isRelativeToScript = false } = {}) {
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

const bpyNumModes = Object.keys(BPyMode)

class DBUserProvider extends Base<Id> implements Base<Id> {
  static stringToId = stringToId
  static idToString = idToString
  db = getPrismaClient()

  relationships: UserRelationProvider

  config = config()

  constructor() {
    super()
    this.db = getPrismaClient()
    this.relationships = new UserRelationProvider()

    if (this.config.avatar.location) {
      ensureDirectorySync(this.config.avatar.location)
    }
  }

  async exists({
    handle,
    keys,
  }: Base.OptType) {
    return (
      await this.db.user.count({
        where: {
          AND: [
            createUserHandleWhereQuery({
              handle,
              selectAgainst: keys || ['id', 'name', 'safeName', 'email'],
            }),
            {
              priv: {
                in: normal,
              },
            },
          ],
        },
      })
    ) > 0
  }

  async getCompactById({ id }: { id: Id }) {
    /* optimized */
    const user = await this.db.user.findFirstOrThrow({
      where: {
        id,
      },
      ...userCompacts,
    })

    return toUserCompact(user, this.config)
  }

  async getCompact(opt: Base.OptType & { scope?: Scope }) {
    const { handle, scope, keys } = opt
    /* optimized */
    const user = await this.db.user.findFirstOrThrow({

      where: {
        AND: [
          createUserHandleWhereQuery({
            handle,
            selectAgainst: keys || ['id', 'name', 'safeName', 'email'],
          }),
          scope === Scope.Self
            ? {}
            : {
                priv: {
                  in: normal,
                },
              }],
      },
      ...userCompacts,
    })
      .catch(() => {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      })
    return toUserCompact(user, this.config)
  }

  async testPassword(opt: Base.OptType, hashedPassword: string) {
    try {
      const user = await this.db.user.findFirstOrThrow({
        where: {
          ...createUserHandleWhereQuery({
            handle: opt.handle,
            selectAgainst: ['id', 'name', 'safeName', 'email'],
          }),
        },
      })
      const result = await compare(hashedPassword, user.pwBcrypt)
      if (!result) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: passwordMismatch,
        })
      }
      return toUserCompact(user, this.config)
    }
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.name === 'NotFoundError') {
          throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
        }
      }
      throw e
    }
  }

  // https://github.com/prisma/prisma/issues/6570 need two separate query to get count for now
  async getBests<M extends Mode, RS extends LeaderboardRankingSystem>({
    id,
    mode,
    ruleset,
    rankingSystem,
    page,
    perPage,
    rankingStatus,
  }: Base.BaseQuery<Id, M, ActiveRuleset, RS>) {
    const start = page * perPage
    const _mode = toBanchoPyMode(mode, ruleset)
    if (_mode === undefined) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'unsupported mode',
      })
    }
    const banchoPyRankingStatus = rankingStatus.map(i => fromRankingStatus(i))

    const orderBy: Prisma.ScoreFindManyArgs['orderBy'] = {}
    if (rankingSystem === Rank.PPv2) {
      orderBy.pp = 'desc'
    }
    else if (rankingSystem === Rank.RankedScore) {
      orderBy.score = 'desc'
    }
    else if (rankingSystem === Rank.TotalScore) {
      orderBy.score = 'desc'
    }
    else {
      throw new Error('unknown ranking system')
    }
    const scores = await this.db.score.findMany({
      where: {
        userId: id,
        mode: _mode,
        status: BanchoPyScoreStatus.Pick,
        beatmap: {
          status: {
            in: banchoPyRankingStatus,
          },
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
  async getTops<M extends ActiveMode, RS extends LeaderboardRankingSystem>(opt: Base.BaseQuery<Id, M, ActiveRuleset, RS>) {
    const { id, mode, ruleset, rankingSystem, page, perPage, rankingStatus } = opt

    const start = page * perPage

    const banchoPyRankingStatus = rankingStatus.map(i => fromRankingStatus(i))

    let scoreIds: number[]
    if (rankingSystem === Rank.RankedScore || rankingSystem === Rank.TotalScore) {
      scoreIds = await this.db.$queryRaw<{ id: string }[]>`
SELECT s.id
FROM scores AS s
INNER JOIN (
    SELECT s.map_md5, MAX(s.pp) AS maxPP
    FROM users AS u
    INNER JOIN scores AS s ON s.userid = u.id
    WHERE u.priv > 2
      AND s.mode = ${toBanchoPyMode(mode, ruleset)}
      AND s.pp > 0
      AND s.status = ${BanchoPyScoreStatus.Pick}
    GROUP BY s.map_md5
) AS tmp ON tmp.maxPP = s.pp AND tmp.map_md5 = s.map_md5
WHERE s.userid = ${id}
`.then(res => res.map(res => Number.parseInt(res.id)))
    }
    else if (rankingSystem === Rank.PPv2) {
      scoreIds = await this.db.$queryRaw<{ id: string }[]>`
SELECT s.id
FROM scores s
INNER JOIN (
    SELECT s.map_md5, MAX(s.score) AS maxScore
    FROM users u
    INNER JOIN scores s ON s.userid = u.id
    WHERE u.priv > 2
      AND s.mode = ${toBanchoPyMode(mode, ruleset)}
      AND s.score > 0
      AND s.status = ${BanchoPyScoreStatus.Pick}
    GROUP BY s.map_md5
) tmp ON tmp.maxScore = s.score AND tmp.map_md5 = s.map_md5
WHERE s.userid = ${id}
`.then(res => res.map(res => Number.parseInt(res.id)))
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
        beatmap: {
          status: {
            in: banchoPyRankingStatus,
          },
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
        score => mapId(score, ScoreProvider.scoreIdToString),
      ),
    }
  }

  async _getStatistics(opt: { id: Id; flag?: CountryCode }) {
    const { id } = opt
    const results = await this.db.stat.findMany({
      where: {
        id,
      },
    })

    const baseQuery = {
      user: {
        priv: {
          in: normal,
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
            [Rank.RankedScore]: {
              gt: stat[Rank.RankedScore],
            },
          },
        }),
        this.db.stat.count({
          where: {
            ...baseQuery,
            mode: stat.mode,
            [Rank.TotalScore]: {
              gt: stat[Rank.TotalScore],
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
    return { results, ranks }
  }

  async getStatistics(opt: { id: Id; flag?: CountryCode }) {
    const { results, ranks } = await this._getStatistics(opt)

    return this._toStatistics(results, ranks)
  }

  async getFull<
    Excludes extends Partial<
      Record<keyof Base.ComposableProperties<Id>, boolean>
    >,
    _Scope extends Scope = Scope.Public,
  >({ handle, excludes, includeHidden, scope }: { handle: string; excludes?: Excludes; includeHidden?: boolean; scope: _Scope }) {
    if (!excludes) {
      excludes = {} as Excludes
    }
    const user = await this.db.user.findFirstOrThrow({
      where: {
        AND: [
          createUserHandleWhereQuery({
            handle,
          }),
          includeHidden ? {} : { priv: { in: normal } },
        ],
      },
    })

    const returnValue = toFullUser(user, this.config) as NonNullable<Awaited<ReturnType<Base<Id>['getFull']>>>
    const parallels: PromiseLike<any>[] = []

    returnValue.status = UserStatus.Offline

    if (excludes.statistics !== true) {
      parallels.push(
        this.getStatistics(returnValue).then((res) => {
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
      }
    }

    await Promise.all(parallels)
      .catch((e) => {
        logger.error(e)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message })
      })

    return returnValue
  }

  async changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      flag?: CountryCode
      preferredMode?: {
        mode: Mode
        ruleset: Ruleset
      }
    },
  ) {
    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: input.email,
        name: input.name,
        safeName: input.name && toSafeName(input.name),
        country: input.flag && fromCountryCode(input.flag),
        preferredMode: input.preferredMode ? toBanchoPyMode(input.preferredMode.mode, input.preferredMode.ruleset) : undefined,
      },
    })
    return toUserCompact(result, this.config)
  }

  async changeUserpage(
    user: UserCompact<Id>,
    input: {
      profile: ArticleProvider.JSONContent
    },
  ) {
    const html = ArticleProvider.render(input.profile)
    try {
      const result = await this.db.user.update({
        where: {
          id: user.id,
        },
        data: {
          userpageContent: await html,
        },
      })
      return {
        html: result.userpageContent || '',
        raw: input.profile,
      }
    }
    catch (err) {
      logger.error(err)
      throw new TRPCError({
        code: 'PARSE_ERROR',
        message: 'unable to process your request at this moment.',
      })
    }
  }

  async changePassword(user: UserCompact<Id>, oldPasswordMD5: string, newPasswordMD5: string) {
    const u = await this.db.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    })

    if (!compare(oldPasswordMD5, u.pwBcrypt)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: oldPasswordMismatch,
      })
    }

    const pwBcrypt = await encryptBanchoPassword(newPasswordMD5)
    const result = await this.db.user.update({
      where: {
        id: u.id,
      },
      data: {
        pwBcrypt,
      },
    })
    return toUserCompact(result, this.config)
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
    const userLike = createUserLikeQuery(keyword)
    /* optimized */
    const result = await this.db.user.findMany({
      ...userCompacts,
      ...merge(userLike, { where: { priv: { in: normal } } }),
      take: limit,
    })

    return result.map(user => toUserCompact(user, this.config))
  }

  async count() {
    /* optimized */
    return await this.db.user.count({
      where: {
        priv: {
          in: normal,
        },
      },
    })
  }

  async changeVisibility(user: UserCompact<Id>) {
    throw new Error('bancho.py does not support user visibility scoping.')
    return user
  }

  async status(opt: { id: Id }) {
    if (!this.config.api?.v1) {
      return null
    }
    return getLiveUserStatus(opt, this.config as { api: { v1: string } })
  }

  async register(opt: { name: string; email: string; passwordMd5: string }) {
    const { name, email, passwordMd5 } = opt

    const user = await this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          safeName: toSafeName(name),
          email,
          pwBcrypt: await encryptBanchoPassword(passwordMd5),
          creationTime: Math.floor(Date.now() / 1000),
        },
      })

      await this.db.stat.createMany({
        data: bpyNumModes.map(mode => ({
          id: user.id,
          mode: Number.parseInt(mode),
        })),
      })
      return user
    })

    return toUserCompact(user, this.config)
  }

  async _toStatistics(
    results: Stat[],
    ranks: {
      mode: number
      ppv2Rank: number
      rankedScoreRank: number
      totalScoreRank: number
    }[],
    livePPRank?: Awaited<ReturnType<RedisUserProvider['getRedisRanks']>>,
  ) {
    const statistics: UserStatistic<
      ActiveMode,
      ActiveRuleset,
      LeaderboardRankingSystem
    > = {
      [Mode.Osu]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.OsuStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.OsuStandard),
          livePPRank: livePPRank?.[Mode.Osu][Ruleset.Standard],
        }),
        [Ruleset.Relax]: createRulesetData({
          databaseResult: results.find(i => i.mode === BanchoPyMode.OsuRelax),
          ranks: ranks.find(i => i.mode === BanchoPyMode.OsuRelax),
          livePPRank: livePPRank?.[Mode.Osu][Ruleset.Relax],
        }),
        [Ruleset.Autopilot]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.OsuAutopilot,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.OsuAutopilot),
          livePPRank: livePPRank?.[Mode.Osu][Ruleset.Autopilot],
        }),
      },
      [Mode.Taiko]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.TaikoStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.TaikoStandard),
          livePPRank: livePPRank?.[Mode.Taiko][Ruleset.Standard],
        }),
        [Ruleset.Relax]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.TaikoRelax,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.TaikoRelax),
          livePPRank: livePPRank?.[Mode.Taiko][Ruleset.Relax],
        }),
      },
      [Mode.Fruits]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.FruitsStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.FruitsStandard),
          livePPRank: livePPRank?.[Mode.Fruits][Ruleset.Standard],
        }),
        [Ruleset.Relax]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.FruitsRelax,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.FruitsRelax),
          livePPRank: livePPRank?.[Mode.Fruits][Ruleset.Relax],
        }),
      },
      [Mode.Mania]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.ManiaStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.ManiaStandard),
          livePPRank: livePPRank?.[Mode.Mania][Ruleset.Standard],
        }),
      },
    }
    return statistics
  }

  async getDynamicSettings({ id }: { id: Id }) {
    const user = await this.db.user.findFirstOrThrow({ where: { id } })
    return {
      apiKey: user.apiKey || undefined,
    } satisfies ServerSetting as ServerSetting
  }

  async setDynamicSettings(user: { id: number }, args: ServerSetting): Promise<ServerSetting> {
    const result = await this.db.user.update({ where: { id: user.id }, data: { apiKey: args.apiKey } })
    return {
      apiKey: result.apiKey || undefined,
    } satisfies ServerSetting
  }
}

export class RedisUserProvider extends DBUserProvider {
  redisClient?: ReturnType<typeof redisClient>
  constructor() {
    super()
    this.redisClient = redisClient()
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

  async getRedisRanks({ id, flag }: { id: Id; flag: CountryCode }) {
    const country = fromCountryCode(flag)
    if (!this.redisClient) {
      return undefined
    }
    return {
      [Mode.Osu]: {
        [Ruleset.Standard]: await this.getLiveRank(
          id,
          BanchoPyMode.OsuStandard,
          country,
        ),
        [Ruleset.Relax]: await this.getLiveRank(id, BanchoPyMode.OsuRelax, country),
        [Ruleset.Autopilot]: await this.getLiveRank(
          id,
          BanchoPyMode.OsuAutopilot,
          country,
        ),
      },
      [Mode.Taiko]: {
        [Ruleset.Standard]: await this.getLiveRank(
          id,
          BanchoPyMode.OsuStandard,
          country,
        ),
        [Ruleset.Relax]: await this.getLiveRank(id, BanchoPyMode.OsuRelax, country),
      },
      [Mode.Fruits]: {
        [Ruleset.Standard]: await this.getLiveRank(
          id,
          BanchoPyMode.OsuStandard,
          country,
        ),
        [Ruleset.Relax]: await this.getLiveRank(id, BanchoPyMode.OsuRelax, country),
      },
      [Mode.Mania]: {
        [Ruleset.Standard]: await this.getLiveRank(
          id,
          BanchoPyMode.OsuStandard,
          country,
        ),
      },
    }
  }

  async getStatistics(opt: { id: Id; flag: CountryCode }) {
    const { results, ranks } = await this._getStatistics(opt)
    const livePPRank = await this.getRedisRanks(opt)

    return this._toStatistics(results, ranks, livePPRank)
  }
}

export const UserProvider = config().leaderboardSource === 'redis' ? RedisUserProvider : DBUserProvider
