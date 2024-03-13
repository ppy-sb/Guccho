import { mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve, sep } from 'node:path'
import { aliasedTable, and, desc, eq, inArray, sql } from 'drizzle-orm'
import { merge } from 'lodash-es'
import imageType from 'image-type'
import { glob } from 'glob'
import { TRPCError } from '@trpc/server'
import { Prisma } from 'prisma-client-bancho-py'
import { type QueryError } from 'mysql2'
import type { Id, ScoreId } from '..'
import { getLiveUserStatus } from '../api-client'
import { normal } from '../constants'
import { compareBanchoPassword, encryptBanchoPassword } from '../crypto'
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
  type AbleToTransformToScores,
  BPyMode,
  createRulesetData,
  fromBanchoPyMode,

  fromCountryCode,
  fromRankingStatus,
  idToString,
  prismaToRankingSystemScores,
  stringToId,
  toBanchoPyMode,
  toFullUser,
  toRankingSystemScores,
  toSafeName,
  toUserClan,
  toUserCompact,
  toUserOptional,
} from '../transforms'
import * as schema from '../drizzle/schema'
import { ArticleProvider } from './article'
import { prismaClient } from './source/prisma'
import { client as redisClient } from './source/redis'
import { UserRelationProvider } from './user-relations'
import { useDrizzle, userPriv } from './source/drizzle'
import { conflictEmail, oldPasswordMismatch, userNotFound } from '~/server/trpc/messages'
import { type DynamicSettingStore, Scope, type UserCompact, type UserStatistic, UserStatus } from '~/def/user'
import type { CountryCode } from '~/def/country-code'
import type { ActiveMode, ActiveRuleset, LeaderboardRankingSystem } from '~/def/common'
import { Mode, Rank, Ruleset } from '~/def'
import { UserProvider as Base } from '$base/server'
import type { ExtractLocationSettings, ExtractSettingType } from '$base/@define-setting'
import { type RankingSystemScore } from '~/def/score'

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
const drizzle = useDrizzle(schema)
export const enum FilterType {
  BlockIfNotMatched,
  BlockIfMatched,
}

class DBUserProvider extends Base<Id, ScoreId> implements Base<Id, ScoreId> {
  static readonly stringToId = stringToId
  static readonly idToString = idToString
  /**
   * @deprecated prisma will be replaced by drizzle
   */
  prisma = prismaClient
  drizzle = drizzle
  relationships = new UserRelationProvider()
  config = config()

  usernamePatterns: Array<{ match: string | RegExp; reason: string; type: FilterType }> = [
    {
      type: FilterType.BlockIfNotMatched,
      match: /^[\w [\]-]{2,15}$/gu,
      reason: 'Username should between 2 - 14 chars long, allows a-z, 0-9, [] and -, _',
    },
  ]

  constructor() {
    super()

    if (this.config.avatar.location) {
      ensureDirectorySync(this.config.avatar.location)
    }
  }

  async exists({
    handle,
    keys = ['id', 'name', 'safeName', 'email'],
  }: Base.OptType) {
    return (
      await this.prisma.user.count({
        where: {
          AND: [
            createUserHandleWhereQuery({
              handle,
              selectAgainst: keys,
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
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        id,
      },
      ...userCompacts,
    })

    return toUserCompact(user, this.config)
  }

  async getCompact(opt: Base.OptType & { scope?: Scope }) {
    const { handle, scope, keys = ['id', 'name', 'safeName', 'email'] } = opt
    /* optimized */
    const user = await this.prisma.user.findFirstOrThrow({

      where: {
        AND: [
          createUserHandleWhereQuery({
            handle,
            selectAgainst: keys,
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

  async testPassword(opt: Base.OptType, hashedPassword: string): Promise<[boolean, UserCompact<Id>]> {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          ...createUserHandleWhereQuery({
            handle: opt.handle,
            selectAgainst: ['id', 'name', 'safeName', 'email'],
          }),
        },
      })
      return [await compareBanchoPassword(hashedPassword, user.pwBcrypt), toUserCompact(user, this.config)]
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
  }: Base.BaseQuery<Id, M, ActiveRuleset, RS>): Promise<RankingSystemScore<ScoreId, Id, Mode, RS>[]> {
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
    const scores = await this.prisma.score.findMany({
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
    return prismaToRankingSystemScores({ scores, rankingSystem, mode }).map(score =>
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

    // derived tables
    const s = aliasedTable(schema.scores, 's')
    const s2 = aliasedTable(schema.scores, 's2')
    const s3 = aliasedTable(schema.scores, 's3')
    const u = aliasedTable(schema.users, 'u')
    const u2 = aliasedTable(schema.users, 'u2')
    const bm = aliasedTable(schema.beatmaps, 'm')
    const bms = aliasedTable(schema.sources, 'ms')

    const userHaveScores = this.drizzle.selectDistinct({ md5: s3.mapMd5 })
      .from(s3)
      .where(and(
        eq(s3.mode, toBanchoPyMode(mode, ruleset)),
        eq(s3.userId, id)
      )).as('ssq')

    const maxScores = this.drizzle.select({
      mapMd5: s2.mapMd5,
      v: sql`MAX(${rankingSystem === Rank.PPv2 ? s2.pp : s2.score})`.as('v'),
      countScores: sql`COUNT(*)`.mapWith(Number).as('countScores'),
      lowestId: sql`MIN(${s2.id})`.as('lowestId'),
    }).from(s2)
      .innerJoin(u2, eq(s2.userId, u2.id))
      .innerJoin(userHaveScores, eq(userHaveScores.md5, s2.mapMd5))
      .where(and(
        userPriv(u2),
        eq(s2.mode, toBanchoPyMode(mode, ruleset)),
      ))
      .groupBy(s2.mapMd5)
      .as('sq')

    const q2 = this.drizzle.select({
      score: s,
      beatmap: bm,
      beatmapset: bms,
      fullCount: sql`COUNT(*) OVER()`.mapWith(Number).as('full_count'),
    }).from(s)
      .innerJoin(maxScores, and(
        eq(maxScores.mapMd5, s.mapMd5),
        eq(rankingSystem === Rank.PPv2 ? s.pp : s.score, maxScores.v),
        eq(s.id, maxScores.lowestId)
      ))
      .innerJoin(bm, and(
        eq(bm.md5, s.mapMd5),
        inArray(bm.status, banchoPyRankingStatus),
      ))
      .innerJoin(bms, and(
        eq(bm.setId, bms.id),
        eq(bm.server, bms.server)
      ))
      .innerJoin(u, eq(u.id, s.userId))
      .where(eq(s.userId, id))
      .orderBy(
        desc(maxScores.countScores),
        desc(s.id)
      )
      .offset(start)
      .limit(perPage)

    const scoresData = await q2

    const count = scoresData.length > 0 ? scoresData[0].fullCount : 0
    const scores = scoresData.map((sd) => {
      const { score, beatmap, beatmapset } = sd
      return {
        ...score,
        beatmap: {
          ...beatmap,
          source: beatmapset,
        },
      } satisfies AbleToTransformToScores
    })

    return {
      count,
      scores: toRankingSystemScores({ scores, rankingSystem, mode }),
    }
  }

  async _getStatistics(opt: { id: Id; flag?: CountryCode }) {
    const { id } = opt
    const sq = this.drizzle.select({
      id: schema.stats.id,
      mode: schema.stats.mode,

      ppv2Rank: sql`RANK() OVER(PARTITION BY ${schema.stats.mode} ORDER BY ${schema.stats.pp} DESC)`
        .mapWith(Number)
        .as('ppRank'),
      ppv2CountryRank: sql`RANK() OVER(PARTITION BY ${schema.stats.mode}, ${schema.users.country} ORDER BY ${schema.stats.pp} DESC)`
        .mapWith(Number)
        .as('ppCountryRank'),

      totalScoreRank: sql`RANK() OVER(PARTITION BY ${schema.stats.mode} ORDER BY ${schema.stats.totalScore} DESC)`
        .mapWith(Number)
        .as('tscoreRank'),
      totalScoreCountryRank: sql`RANK() OVER(PARTITION BY ${schema.stats.mode}, ${schema.users.country} ORDER BY ${schema.stats.totalScore} DESC)`
        .mapWith(Number)
        .as('tscoreCountryRank'),

      rankedScoreRank: sql`RANK() OVER(PARTITION BY ${schema.stats.mode} ORDER BY ${schema.stats.rankedScore} DESC)`
        .mapWith(Number)
        .as('rscoreRank'),
      rankedScoreCountryRank: sql`RANK() OVER(PARTITION BY ${schema.stats.mode}, ${schema.users.country} ORDER BY ${schema.stats.rankedScore} DESC)`
        .mapWith(Number)
        .as('rscoreCountryRank'),
    })
      .from(schema.stats)
      .innerJoin(schema.users, and(
        eq(schema.users.id, schema.stats.id),
        userPriv(schema.users)
      )).as('sq')

    const s2 = aliasedTable(schema.stats, 's2')
    const mq = this.drizzle.select({
      ppv2Rank: sq.ppv2Rank,
      ppv2CountryRank: sq.ppv2CountryRank,

      totalScoreRank: sq.totalScoreRank,
      totalScoreCountryRank: sq.totalScoreCountryRank,

      rankedScoreRank: sq.rankedScoreRank,
      rankedScoreCountryRank: sq.rankedScoreCountryRank,
      stat: s2,
    }).from(sq)
      .innerJoin(s2,
        and(
          eq(sq.id, s2.id),
          eq(sq.mode, s2.mode),
        )
      )
      .where(eq(s2.id, id))

    return await mq
  }

  async getStatistics(opt: { id: Id; flag?: CountryCode }) {
    const query = await this._getStatistics(opt)

    return this._toStatistics(query)
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
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        AND: [
          createUserHandleWhereQuery({
            handle,
          }),
          includeHidden ? {} : { priv: { in: normal } },
        ],
      },
      include: {
        clan: true,
      },
    })

    const returnValue = toFullUser(user, this.config) as NonNullable<Awaited<ReturnType<Base<Id, ScoreId>['getFull']>>>
    const [mode, ruleset] = fromBanchoPyMode(user.preferredMode)
    returnValue.preferredMode = {
      mode, ruleset,
    }
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

    if (excludes.clan !== true) {
      returnValue.clan = toUserClan(user).clan
    }

    if (excludes.profile !== true) {
      returnValue.profile = {
        html: user.userpageContent ?? '',
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
    input.name && this.ensureUsernameIsAllowed(input.name)

    await this.drizzle.update(schema.users)
      .set({
        email: input.email,

        name: input.name,

        safeName: input.name && toSafeName(input.name),

        country: input.flag && fromCountryCode(input.flag),

        preferredMode: input.preferredMode
          ? toBanchoPyMode(input.preferredMode.mode, input.preferredMode.ruleset)
          : undefined,
      })
      .where(eq(schema.users.id, user.id))
      .catch((e: QueryError) => {
        if (e.code === 'ER_DUP_ENTRY') {
          raise(TRPCError, { code: 'CONFLICT', message: conflictEmail })
        }
        throw e
      })

    const returning = await this.drizzle.query.users.findFirst({
      where(eq, op) {
        return op.eq(eq.id, user.id)
      },
      with: {
        clan: true,
      },
    }) ?? raise(Error, userNotFound)

    return {
      ...toUserCompact(returning, this.config),
      ...toUserClan(returning),
      ...toUserOptional(returning),
    }
  }

  async changeUserpage(
    user: UserCompact<Id>,
    input: {
      profile: ArticleProvider.JSONContent
    },
  ) {
    const html = ArticleProvider.render(input.profile)
    try {
      const result = await this.prisma.user.update({
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

  async changePassword(user: Pick<UserCompact<Id>, 'id'>, oldPasswordMD5: string, newPasswordMD5: string) {
    const u = await this.prisma.user.findFirstOrThrow({
      where: {
        id: user.id,
      },
    })

    if (!await compareBanchoPassword(oldPasswordMD5, u.pwBcrypt)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: oldPasswordMismatch,
      })
    }

    const pwBcrypt = await encryptBanchoPassword(newPasswordMD5)
    const result = await this.prisma.user.update({
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
    const result = await this.prisma.user.findMany(merge(structuredClone(userCompacts), merge(userLike, { where: { priv: { in: normal } }, select: { clan: true }, take: limit })))

    return result.map(user => ({
      ...toUserCompact(user, this.config),
      ...toUserClan(user),
    }))
  }

  async count() {
    /* optimized */
    return await this.drizzle.select({
      count: sql`COUNT(*)`.mapWith(Number),
    }).from(schema.users).where(userPriv(schema.users)).then(res => res[0].count)
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
    this.ensureUsernameIsAllowed(name)

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          safeName: toSafeName(name),
          email,
          pwBcrypt: await encryptBanchoPassword(passwordMd5),
          creationTime: Math.floor(Date.now() / 1000),
        },
      })

      await this.prisma.stat.createMany({
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
    results: ({
      stat: typeof schema.stats.$inferSelect

      ppv2Rank: number
      ppv2CountryRank: number

      totalScoreCountryRank: number
      totalScoreRank: number

      rankedScoreCountryRank: number
      rankedScoreRank: number
    })[],
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
            i => i.stat.mode === BanchoPyMode.OsuStandard,
          ),
          livePPRank: livePPRank?.[Mode.Osu][Ruleset.Standard],
        }),
        [Ruleset.Relax]: createRulesetData({
          databaseResult: results.find(i => i.stat.mode === BanchoPyMode.OsuRelax),
          livePPRank: livePPRank?.[Mode.Osu][Ruleset.Relax],
        }),
        [Ruleset.Autopilot]: createRulesetData({
          databaseResult: results.find(
            i => i.stat.mode === BanchoPyMode.OsuAutopilot,
          ),
          livePPRank: livePPRank?.[Mode.Osu][Ruleset.Autopilot],
        }),
      },
      [Mode.Taiko]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.stat.mode === BanchoPyMode.TaikoStandard,
          ),
          livePPRank: livePPRank?.[Mode.Taiko][Ruleset.Standard],
        }),
        [Ruleset.Relax]: createRulesetData({
          databaseResult: results.find(
            i => i.stat.mode === BanchoPyMode.TaikoRelax,
          ),
          livePPRank: livePPRank?.[Mode.Taiko][Ruleset.Relax],
        }),
      },
      [Mode.Fruits]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.stat.mode === BanchoPyMode.FruitsStandard,
          ),
          livePPRank: livePPRank?.[Mode.Fruits][Ruleset.Standard],
        }),
        [Ruleset.Relax]: createRulesetData({
          databaseResult: results.find(
            i => i.stat.mode === BanchoPyMode.FruitsRelax,
          ),
          livePPRank: livePPRank?.[Mode.Fruits][Ruleset.Relax],
        }),
      },
      [Mode.Mania]: {
        [Ruleset.Standard]: createRulesetData({
          databaseResult: results.find(
            i => i.stat.mode === BanchoPyMode.ManiaStandard,
          ),
          livePPRank: livePPRank?.[Mode.Mania][Ruleset.Standard],
        }),
      },
    }
    return statistics
  }

  async getDynamicSettings({ id }: { id: Id }) {
    const user = await this.prisma.user.findFirstOrThrow({ where: { id } })
    return {
      apiKey: user.apiKey || undefined,
    } satisfies ServerSetting as ServerSetting
  }

  async setDynamicSettings(user: { id: number }, args: ServerSetting): Promise<ServerSetting> {
    const returnValue = await this.drizzle.query.users.findFirst({
      where(table, op) {
        return op.eq(table.id, user.id)
      },
      columns: {
        apiKey: true,
      },
    })
    return {
      apiKey: returnValue?.apiKey || undefined,
    }

    // const result = await this.prisma.user.update({ where: { id: user.id }, data: { apiKey: args.apiKey } })
    // return {
    //   apiKey: result.apiKey || undefined,
    // } satisfies ServerSetting
  }

  ensureUsernameIsAllowed(input: string) {
    // eslint-disable-next-line array-callback-return
    const failedPattern = this.usernamePatterns.find((pattern) => {
      switch (pattern.type) {
        case FilterType.BlockIfNotMatched:
          return !input.match(pattern.match)
        case FilterType.BlockIfMatched:
          return input.match(pattern.match)
        default:
          assertNotReachable(pattern.type)
      }
    })
    if (failedPattern) {
      raise(Error, failedPattern.reason)
    }
  }
}

export class RedisUserProvider extends DBUserProvider {
  redisClient: ReturnType<typeof redisClient>
  constructor() {
    super()
    this.redisClient = redisClient()
  }

  async getLiveRank(id: number, mode: number, country: string) {
    if (this.redisClient.isReady) {
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
    const res = await this._getStatistics(opt)
    const livePPRank = await this.getRedisRanks(opt)

    return this._toStatistics(res, livePPRank)
  }
}

export const UserProvider = config().leaderboardSource === 'redis' ? RedisUserProvider : DBUserProvider
