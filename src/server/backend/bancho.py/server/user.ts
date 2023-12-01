import { mkdirSync } from 'node:fs'
import { unlink, writeFile } from 'node:fs/promises'
import { isAbsolute, join, resolve, sep } from 'node:path'
import { merge } from 'lodash-es'
import imageType from 'image-type'
import { glob } from 'glob'
import { TRPCError } from '@trpc/server'
import { Prisma, type Stat } from 'prisma-client-bancho-py'
import type { Id } from '..'
import { getLiveUserStatus } from '../api-client'
import { normal } from '../constants'
import { compareBanchoPassword, encryptBanchoPassword } from '../crypto'
import {
  createUserHandleWhereQuery,
  createUserLikeQuery,
  userCompacts,
} from '../db-query'
import type { settings } from '../dynamic-settings'
import { BanchoPyMode, BanchoPyPrivilege, BanchoPyScoreStatus } from '../enums'
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
  stringToId,
  toBanchoPyMode,
  toFullUser,
  toRankingSystemScores,
  toSafeName,
  toUserClan,
  toUserCompact,
} from '../transforms'
import { ArticleProvider } from './article'
import { ScoreProvider } from './score'
import { getPrismaClient } from './source/prisma'
import { client as redisClient } from './source/redis'
import { UserRelationProvider } from './user-relations'
import { oldPasswordMismatch, userNotFound } from '~/server/trpc/messages'
import { type DynamicSettingStore, Scope, type UserCompact, type UserStatistic, UserStatus } from '~/def/user'
import type { CountryCode } from '~/def/country-code'
import type { ActiveMode, ActiveRuleset, LeaderboardRankingSystem } from '~/def/common'
import { Mode, Rank, Ruleset } from '~/def'
import { UserProvider as Base } from '$base/server'
import type { ExtractLocationSettings, ExtractSettingType } from '$base/@define-setting'

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
  /**
   * @deprecated prisma will be replaced by drizzle
   */
  db = getPrismaClient()
  usernamePattern = /^[\w [\]-]{2,15}$/

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
    keys = ['id', 'name', 'safeName', 'email'],
  }: Base.OptType) {
    return (
      await this.db.user.count({
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
    const user = await this.db.user.findFirstOrThrow({
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
    const user = await this.db.user.findFirstOrThrow({

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
      const user = await this.db.user.findFirstOrThrow({
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

    const rankingColumn = rankingSystem === Rank.PPv2 ? 'pp' : 'score'

    const sql = /* sql */`
SELECT s.*,
       m.id map_id,
       m.server map_server,
       m.set_id,
       m.status map_status,
       m.md5 map_md5,
       m.artist,
       m.title,
       m.version,
       m.creator,
       m.filename,
       m.last_update,
       m.total_length,
       m.max_combo map_max_combo,
       m.frozen,
       m.plays,
       m.passes,
       m.mode map_mode,
       m.bpm,
       m.cs,
       m.ar,
       m.od,
       m.hp,
       m.diff,
       ms.server source_server,
       ms.id source_id,
       ms.last_osuapi_check,
       COUNT(*) OVER() full_count
FROM scores s
INNER JOIN (
    SELECT s2.map_md5, MAX(s2.${rankingColumn}) v, COUNT(*) count_scores, MIN(s2.id) lowestId
    FROM scores s2
    INNER JOIN users u ON s2.userid = u.id
    WHERE u.priv & ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified} = ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified}
      AND s2.mode = ?
      AND s2.map_md5 IN (
        SELECT DISTINCT(s3.map_md5) from scores s3
        WHERE s3.mode = ?
          AND s3.userid = ?
    )
    GROUP BY s2.map_md5
) max_scores
ON s.map_md5 = max_scores.map_md5 AND s.${rankingColumn} = max_scores.v AND s.id = max_scores.lowestId

INNER JOIN maps m ON m.md5 = s.map_md5 AND m.status IN (${banchoPyRankingStatus.join(',')})
INNER JOIN mapsets ms ON m.set_id = ms.id AND m.server = ms.server
INNER JOIN users u ON u.id = s.userid

WHERE s.userid = ?
ORDER BY
  max_scores.count_scores DESC,
  s.id DESC
LIMIT ?, ?
`

    const scoresData = await this.db.$queryRawUnsafe<ScoreWithMapDetails[]>(
      sql,
      // params
      toBanchoPyMode(mode, ruleset),
      toBanchoPyMode(mode, ruleset),
      id,
      id,
      start,
      perPage, // Used in LIMIT for pagination (number of rows to fetch)
    )

    const count = scoresData.length > 0 ? scoresData[0].full_count : 0
    const scores = scoresData.map((sd) => {
      return {
        id: BigInt(sd.id),
        mapMd5: sd.map_md5,
        score: sd.score,
        pp: sd.pp,
        acc: sd.acc,
        maxCombo: sd.max_combo,
        mods: sd.mods,
        n300: sd.n300,
        n100: sd.n100,
        n50: sd.n50,
        nMiss: sd.nmiss,
        nGeki: sd.ngeki,
        nKatu: sd.nkatu,
        grade: sd.grade,
        status: sd.status,
        mode: sd.mode,
        playTime: sd.play_time, // Assuming date is returned in a format that Date constructor can parse
        timeElapsed: sd.time_elapsed,
        clientFlags: sd.client_flags,
        userId: sd.userid,
        perfect: !!sd.perfect, // If perfect is returned as 1/0, convert to boolean
        onlineChecksum: sd.online_checksum,
        beatmap: {
          artist: sd.artist,
          title: sd.title,
          version: sd.version,
          creator: sd.creator,
          lastUpdate: sd.last_update, // Assuming date is returned in a format that Date constructor can parse
          totalLength: sd.total_length,
          maxCombo: sd.map_max_combo,
          mode: sd.map_mode,
          bpm: sd.bpm,
          cs: sd.cs,
          ar: sd.ar,
          od: sd.od,
          hp: sd.hp,
          diff: sd.diff,

          id: sd.map_id,
          server: sd.map_server === 'osu!' ? 'bancho' : 'privateServer',
          setId: sd.set_id,
          status: sd.map_status,
          md5: sd.map_md5,
          filename: sd.filename,
          frozen: !!sd.frozen,
          plays: sd.plays,
          passes: sd.passes,
          source: {
            server: sd.source_server === 'osu!' ? 'bancho' : 'privateServer',
            id: sd.source_id,
            lastOsuApiCheck: sd.last_osuapi_check,
          },
        },
      } satisfies AbleToTransformToScores
    })

    return {
      count,
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
      const [ppv2, rankedScore, totalScore] = await this.db.$transaction([
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
      include: {
        clan: true,
      },
    })

    const returnValue = toFullUser(user, this.config) as NonNullable<Awaited<ReturnType<Base<Id>['getFull']>>>
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
    input.name && this.assertUsernameAllowed(input.name)

    const result = await this.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: input.email,

        name: input.name,

        safeName: input.name && toSafeName(input.name),

        country: input.flag && fromCountryCode(input.flag),

        preferredMode: input.preferredMode
          ? toBanchoPyMode(input.preferredMode.mode, input.preferredMode.ruleset)
          : undefined,
      },
      include: {
        clan: true,
      },
    })
    return {
      ...toUserCompact(result, this.config),
      ...toUserClan(result),
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

  async changePassword(user: Pick<UserCompact<Id>, 'id'>, oldPasswordMD5: string, newPasswordMD5: string) {
    const u = await this.db.user.findFirstOrThrow({
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
    const result = await this.db.user.findMany(merge(structuredClone(userCompacts), merge(userLike, { where: { priv: { in: normal } }, select: { clan: true }, take: limit })))

    return result.map(user => ({
      ...toUserCompact(user, this.config),
      ...toUserClan(user),
    }))
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
    this.assertUsernameAllowed(name)

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

  assertUsernameAllowed(input: string) {
    const result = input.match(this.usernamePattern)
    if (!result) {
      throw new Error('Invalid username, please try something different.')
    }
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

interface ScoreWithMapDetails {
  // Fields from the 'scores' table
  id: string // or number | bigint, depending on how your database returns BIGINT
  map_md5: string
  map_server: 'osu!' | 'private'
  score: number
  pp: number
  acc: number
  max_combo: number
  mods: number
  n300: number
  n100: number
  n50: number
  nmiss: number
  ngeki: number
  nkatu: number
  grade: string
  status: number
  mode: number
  play_time: Date
  time_elapsed: number
  client_flags: number
  userid: number
  perfect: number
  online_checksum: string

  map_id: number
  set_id: number
  map_status: number
  artist: string
  title: string
  version: string
  creator: string
  filename: string
  last_update: Date
  total_length: number
  map_max_combo: number
  frozen: number
  plays: number
  passes: number
  map_mode: number
  bpm: number
  cs: number
  ar: number
  od: number
  hp: number
  diff: number

  // Fields from the 'mapsets' table
  source_server: 'osu!' | 'private'
  source_id: number
  last_osuapi_check: Date

  // The count of all rows that match the query without the limit
  full_count: number
}
