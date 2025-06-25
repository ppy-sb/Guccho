import { and, count, desc, eq, max, sql, sum } from 'drizzle-orm'
import type { Id } from '../..'
import { encryptBanchoPassword } from '../../crypto'
import * as schema from '../../drizzle/schema'
import { type BanchoPyMode, BanchoPyPrivilege, BanchoPyScoreStatus } from '../../enums'
import { config } from '../../env'
import { Logger } from '../../log'
import { type DatabaseUserCompactFields, type DatabaseUserOptionalFields, fromCountryCode, toBanchoPyMode, toBanchoPyPriv, toRoles, toSafeName, toUserCompact, toUserOptional } from '../../transforms'
import { useDrizzle } from '../source/drizzle'
import { type ComputedUserRole } from '~/utils/common'
import { type UserClan, type UserCompact, type UserOptional, UserRole, type UserSecrets } from '~/def/user'
import { type ModeRulesetScoreStatistic } from '~/def/statistics'
import { Grade } from '~/def/score'
import { GucchoError } from '~/def/messages'
import { type Mode, type Ruleset } from '~/def'
import { isRoleEditable } from '~/common/utils/admin'
import { AdminUserProvider as Base } from '$base/server'

const logger = Logger.child({ label: 'user' })

const drizzle = useDrizzle(schema)

type DatabaseAdminUserFields = 'lastActivity' | 'creationTime'
export class AdminUserProvider extends Base<Id> implements Base<Id> {
  config = config()
  drizzle = drizzle
  logger = logger
  async userList(
    query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> &
    Partial<UserSecrets> & {
      page: number
      perPage: number
    }
  ) {
    const rolesPriv = toBanchoPyPriv(query.roles || [], 0)

    const cond = [
      query.id ? eq(schema.users.id, query.id) : undefined,
      query.name ? eq(schema.users.name, query.name) : undefined,
      query.safeName ? eq(schema.users.safeName, query.safeName) : undefined,
      query.email ? eq(schema.users.email, query.email) : undefined,
      query.flag ? eq(schema.users.country, query.flag) : undefined,
      query.roles?.length ? sql`${schema.users.priv} & ${rolesPriv} = ${rolesPriv}` : undefined,
      query.roles?.includes(UserRole.Restricted) ? sql`${schema.users.priv} & 1 = 0` : undefined,
    ]

    const baseQuery = this.drizzle
      .select({
        user: pick(schema.users, [
          'id',
          'name',
          'safeName',
          'priv',
          'country',
          'email',
          'preferredMode',
          'lastActivity',
          'creationTime',
        ] satisfies Array<
          | DatabaseUserCompactFields
          | DatabaseUserOptionalFields
          | DatabaseAdminUserFields
        >),
        clan: pick(schema.clans, ['id', 'name', 'badge']),
      })
      .from(schema.users)
      .leftJoin(schema.clans, eq(schema.clans.id, schema.users.clanId))
      .where(and(...cond))
      .orderBy(desc(schema.users.lastActivity))
      .offset(query.page * query.perPage)
      .limit(query.perPage)

    const uCompacts = baseQuery.then(res =>
      res.map(({ user, clan }) => ({
        ...toUserCompact(user, this.config),
        ...toUserOptional(user),
        lastActivityAt: new Date(user.lastActivity * 1000),
        registeredAt: new Date(user.creationTime * 1000),
        clan: clan
          ? ({
              id: clan.id,
              name: clan.name,
              badge: clan.badge,
            } satisfies UserClan<Id>)
          : undefined,
      }))
    ) satisfies Promise<
      Array<
        UserCompact<Id> &
        Pick<UserOptional, 'email' | 'status'> & {
          registeredAt: Date
          lastActivityAt: Date
          clan?: UserClan<Id>
        }
      >
    >

    return Promise.all([

      this.drizzle
        .select({
          count: sql`count(*)`.mapWith(Number),
        })
        .from(schema.users)
        .leftJoin(schema.clans, eq(schema.clans.id, schema.users.clanId))
        .where(
          and(...cond)
        )
        .execute()
        .then(res => res[0].count),

      uCompacts,
    ] as const)
  }

  async userDetail(query: { id: Id }): Promise<UserCompact<Id> & UserOptional> {
    const user = await this.drizzle.query.users.findFirst({
      where: eq(schema.users.id, query.id),
    }) ?? throwGucchoError(GucchoError.UserNotFound)

    return {
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
    }
  }

  /**
   * This function merges the current roles with the roles to be updated.
   * It filters out the roles that cannot be edited by the current user,
   * and then appends the roles that can be edited.
   *
   */
  mergeUpdateRoles(
    updater: { role: ComputedUserRole },
    currentRoles: UserRole[],
    updateRoles: UserRole[]
  ) {
    return currentRoles
      // Filter out the roles that cannot be edited by the current user.
      // The current user can only edit roles that are not editable by themselves.
      .filter(r =>
        !isRoleEditable(updater.role, r)
      )
      // Filter out the roles that can be edited by the current user.
      // The current user can edit roles that are editable by themselves.
      .concat(
        updateRoles.filter(r =>
          isRoleEditable(updater.role, r)
        )
      )
  }

  async updateUserDetail(
    updater: { role: ComputedUserRole },
    query: { id: Id },
    updateFields: Partial<UserCompact<Id> & UserOptional & UserSecrets>
  ): Promise<UserCompact<Id> & UserOptional> {
    const { priv }
      = (await this.drizzle.query.users.findFirst({
        where: eq(schema.users.id, query.id),
        columns: {
          priv: true,
        },
      })) ?? throwGucchoError(GucchoError.UserNotFound)

    const currentRoles = toRoles(priv)

    const basePriv = updateFields.roles?.includes(UserRole.Restricted)
      ? BanchoPyPrivilege.Any | (priv & BanchoPyPrivilege.Verified)
      : BanchoPyPrivilege.Registered | (priv & BanchoPyPrivilege.Verified)

    logger.info(`Updating user <${query.id}>, fields: ${Object.entries(updateFields).map(([k, v]) => `${k} = ${k === 'password' ? '[deducted]' : v}`).join(', ')}`, {
      id: query.id,
      fields: updateFields,
    })

    await this.drizzle
      .update(schema.users)
      .set({
        id: updateFields.id,
        name: updateFields.name,
        safeName: updateFields.name ? toSafeName(updateFields.name) : undefined,
        pwBcrypt: updateFields.password
          ? await encryptBanchoPassword(updateFields.password)
          : undefined,
        email: updateFields.email,
        country: updateFields.flag
          ? fromCountryCode(updateFields.flag)
          : undefined,
        priv: updateFields.roles
          ? toBanchoPyPriv(
            this.mergeUpdateRoles(updater, currentRoles, updateFields.roles),
            basePriv
          )
          : undefined,
      })
      .where(eq(schema.users.id, query.id))

    const user
      = (await this.drizzle.query.users.findFirst({
        where: eq(schema.users.id, updateFields.id ?? query.id),
      })) ?? raise(Error, 'cannot find updated user. Did you changed user id?')

    return {
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
    }
  }

  computeScoreStatus = this.drizzle
    .select({
      id: schema.scores.userId,
      mode: schema.scores.mode,
      totalScore: sum(schema.scores.score).mapWith(BigInt).as('computedTotalScore'),
      totalHit: sum(sql`${schema.scores.n50} + ${schema.scores.n100} + ${schema.scores.n300} + ${schema.scores.nGeki} + ${schema.scores.nKatu}`).mapWith(BigInt).as('computedTTH'),
      playTime: sum(schema.scores.timeElapsed).mapWith(Number).as('computedPlayTime'),
      playCount: count(sql`1`).as('playCount'),
    })
    .from(schema.scores)
    .groupBy(schema.scores.userId, schema.scores.mode)
    .as('cts')

  computeRankedScoreStatus = this.drizzle
    .select({
      id: schema.scores.userId,
      mode: schema.scores.mode,
      rankedScore: sum(schema.scores.score).mapWith(BigInt).as('rankedScore'),
      maxCombo: max(schema.scores.maxCombo).mapWith(Number).as('maxCombo'),
      count: {
        A: count(sql`if(${schema.scores.grade} = ${Grade.A}, 1, null)`).as('gradeA'),
        B: count(sql`if(${schema.scores.grade} = ${Grade.B}, 1, null)`).as('gradeB'),
        C: count(sql`if(${schema.scores.grade} = ${Grade.C}, 1, null)`).as('gradeC'),
        D: count(sql`if(${schema.scores.grade} = ${Grade.D}, 1, null)`).as('gradeD'),
        F: count(sql`if(${schema.scores.grade} = ${Grade.F}, 1, null)`).as('gradeF'),
        S: count(sql`if(${schema.scores.grade} = ${Grade.S}, 1, null)`).as('gradeS'),
        SH: count(sql`if(${schema.scores.grade} = ${Grade.SH}, 1, null)`).as('gradeSH'),
        SS: count(sql`if(${schema.scores.grade} = ${Grade.SS}, 1, null)`).as('gradeSS'),
        SSH: count(sql`if(${schema.scores.grade} = ${Grade.SSH}, 1, null)`).as('gradeSSH'),
      },
    })
    .from(schema.scores)
    .groupBy(schema.scores.userId, schema.scores.mode)
    .where(eq(schema.scores.status, BanchoPyScoreStatus.Pick))
    .as('crs')

  /**
   * Calculates and updates user statistics using Drizzle query builder and CTEs, matching the provided SQL logic.
   * Returns the updated stats as ModeRulesetScoreStatistic.
   */
  async recalcUserModeRulesetStatistics(q: { id: Id; mode: Mode; ruleset: Ruleset }): Promise<ModeRulesetScoreStatistic> {
    const { id, mode, ruleset } = q
    const dbMode = toBanchoPyMode(mode, ruleset)

    const query = sql`
      WITH
          ordered_pp AS (
              SELECT
                  s1.id scoreId,
                  s1.userid,
                  s1.mode,
                  s1.pp,
                  s1.acc
              FROM
                  ${schema.scores} s1
              INNER JOIN ${schema.beatmaps} m ON s1.map_md5 = m.md5
              WHERE
                  s1.status = 2
                  AND m.status IN (2, 3)
                  AND s1.pp > 0
                  AND s1.mode = ${dbMode}
                  AND s1.userid = ${id}
              ORDER BY
                  s1.pp DESC,
                  s1.acc DESC,
                  s1.id DESC
          ),
          bests AS (
              SELECT
                  scoreId,
                  pp,
                  acc,
                  ROW_NUMBER() OVER (
                      ORDER BY
                          pp DESC
                  ) AS global_rank
              FROM
                  ordered_pp
          ),
          user_calc AS (
              SELECT
                  SUM(POW (0.95, global_rank - 1) * pp) AS weightedPP,
                  (1 - POW (0.9994, COUNT(*))) * 416.6667 AS bnsPP,
                  SUM(POW (0.95, global_rank - 1) * acc) / SUM(POW (0.95, global_rank - 1)) AS acc
              FROM
                  bests
          ),
          calculated AS (
              SELECT
                  *,
                  weightedPP + bnsPP AS pp
              FROM
                  user_calc
          ),
          concrete_stats AS (
              SELECT
                  COUNT(*) AS count,
                  SUM(s2.score) AS total_score,
                  SUM(IF(m2.status IN (2, 3) AND s2.status = 2, s2.score, 0)) AS ranked_score,
                  SUM(s2.n300 + s2.n100 + s2.n50 + (IF(s2.mode IN (1, 3, 5), s2.ngeki + s2.nkatu, 0))) AS total_hits,
                  SUM(s2.time_elapsed) / 1000 AS play_time,
                  MAX(s2.max_combo) AS max_combo,
                  SUM(s2.grade = "XH") AS xh_count,
                  SUM(s2.grade = "X") AS x_count,
                  SUM(s2.grade = "SH") AS sh_count,
                  SUM(s2.grade = "S") AS s_count,
                  SUM(s2.grade = "A") AS a_count
              FROM
                  ${schema.scores} s2
              LEFT JOIN ${schema.beatmaps} m2 ON s2.map_md5 = m2.md5
              WHERE s2.mode = ${dbMode}
              AND s2.userid = ${id}
          )
      UPDATE ${schema.stats} s
      INNER JOIN concrete_stats cs ON 1
      INNER JOIN calculated c ON 1
      SET
          s.tscore = COALESCE(cs.total_score,0),
          s.plays = COALESCE(cs.count,0),
          s.playtime = COALESCE(cs.play_time,0),
          s.max_combo = COALESCE(cs.max_combo,0),
          s.total_hits = COALESCE(cs.total_hits,0),
          s.xh_count = COALESCE(cs.xh_count,0),
          s.x_count = COALESCE(cs.x_count,0),
          s.sh_count = COALESCE(cs.sh_count,0),
          s.s_count = COALESCE(cs.s_count,0),
          s.a_count = COALESCE(cs.a_count,0),
          s.pp = COALESCE(c.pp,0),
          s.acc = COALESCE(c.acc,0),
          s.rscore = COALESCE(cs.ranked_score,0)
      WHERE s.id = ${id} AND s.mode = ${dbMode}`

    await this.drizzle.execute(query)

    // Return the updated stats using the existing method
    return this.getUserModeRulesetStatistics({ id, mode, ruleset })
  }

  async getUserModeRulesetStatistics(query: { id: Id; mode: Mode; ruleset: Ruleset }): Promise<ModeRulesetScoreStatistic> {
    const res = await this.drizzle.query.stats.findFirst({
      where: (tbl, op) => op.and(op.eq(tbl.id, query.id), op.eq(tbl.mode, toBanchoPyMode(query.mode, query.ruleset))),
    }) ?? throwGucchoError(GucchoError.UserNotFound)
    return {
      playCount: res.plays,
      playTime: res.playTime,
      totalHits: BigInt(res.totalHits),
      level: getLevel(res.totalScore),
      maxCombo: res.maxCombo,
      scoreRankComposition: {
        [Grade.F]: 0,
        [Grade.D]: 0,
        [Grade.C]: 0,
        [Grade.B]: 0,
        [Grade.A]: res.aCount,
        [Grade.SH]: res.shCount,
        [Grade.SS]: res.xCount,
        [Grade.SSH]: res.xhCount,
        [Grade.S]: res.sCount,
      },
      rankedScore: res.rankedScore,
      totalScore: res.totalScore,
    }
  }

  async clearUserModeRulesetStatistics(query: { id: Id; mode: Mode; ruleset: Ruleset }): Promise<ModeRulesetScoreStatistic> {
    await this.drizzle.update(schema.stats)
      .set({
        totalScore: 0n,
        rankedScore: 0n,
        plays: 0,
        playTime: 0,
        maxCombo: 0,
        totalHits: 0,
        xhCount: 0,
        xCount: 0,
        shCount: 0,
        sCount: 0,
        aCount: 0,
        pp: 0,
        accuracy: 0,
      })
      .where(
        and(
          eq(schema.stats.id, query.id),
          eq(schema.stats.mode, toBanchoPyMode(query.mode, query.ruleset))
        )
      )

    return await this.getUserModeRulesetStatistics(query)
  }

  async recalcUserAllStatistics(query: { id: Id }): Promise<void> {
    return await this._recalcStats({
      calcPP: true,
      slowStatistics: true,
      verySlowStatistics: true,
      userIds: [query.id],
    })
  }

  async clearUserAllStatistics(query: { id: Id }): Promise<void> {
    await this.drizzle.update(schema.stats)
      .set({
        totalScore: 0n,
        rankedScore: 0n,
        plays: 0,
        playTime: 0,
        maxCombo: 0,
        totalHits: 0,
        xhCount: 0,
        xCount: 0,
        shCount: 0,
        sCount: 0,
        aCount: 0,
        pp: 0,
        accuracy: 0,
      })
      .where(
        and(
          eq(schema.stats.id, query.id)
        )
      )
  }

  metrics(input: Base.MetricsParam): Promise<Base.Metrics> {
    const now = Math.floor(Date.now() / 1000)
    const active = input.active === 'daily' ? 24 * 60 * 60 : input.active === 'weekly' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60
    return this.drizzle.select({
      count: sql`count(*)`.mapWith(Number),
      active: sql`count(if(${schema.users.lastActivity} > ${now - active}, 1, null))`.mapWith(Number),
      restricted: sql`count(if(${schema.users.priv} & ${BanchoPyPrivilege.Verified | BanchoPyPrivilege.Registered} = 0, 1, null))`.mapWith(Number),
      new: sql`count(if(${schema.users.creationTime} > ${now - active}, 1, null))`.mapWith(Number),
    })
      .from(schema.users)
      .then(res => ({
        count: {
          total: res[0].count,
          active: res[0].active,
          restricted: res[0].restricted,
          new: res[0].new,
        },
      }))
  }

  /**
   * github:nyamatrix <https://github.com/ppy-sb/nyamatrix>
   */
  async _recalcStats(options: {
    calcPP?: boolean
    slowStatistics?: boolean
    verySlowStatistics?: boolean
    modes?: BanchoPyMode[]
    userIds?: Id[]
  }) {
    const CALC_PP_CTES = /* sql */ `
    ordered_pp AS (
        SELECT
            s.id scoreId,
            s.userid,
            s.mode,
            s.pp,
            s.acc
        FROM
            scores s
        INNER JOIN maps m ON s.map_md5 = m.md5
        WHERE
            s.status = 2
            AND m.status IN (2, 3)
            AND s.pp > 0
        ORDER BY
            s.pp DESC,
            s.acc DESC,
            s.id DESC
    ),
    bests AS (
        SELECT
            scoreId,
            userid,
            mode,
            pp,
            acc,
            ROW_NUMBER() OVER (
                PARTITION BY
                    userid,
                    mode
                ORDER BY
                    pp DESC
            ) AS global_rank
        FROM
            ordered_pp
    ),
    user_calc AS (
        SELECT
            userid,
            mode,
            COUNT(*) AS count,
            SUM(POW (0.95, global_rank - 1) * pp) AS weightedPP,
            (1 - POW (0.9994, COUNT(*))) * 416.6667 AS bnsPP,
            SUM(POW (0.95, global_rank - 1) * acc) / SUM(POW (0.95, global_rank - 1)) AS acc
        FROM
            bests
        GROUP BY
            userid,
            mode
    ),
    calculated AS (
        SELECT
            *,
            weightedPP + bnsPP AS pp
        FROM
            user_calc
    )`

    const CONCRETE_STATS_CTES = /* sql */`
      concrete_stats AS (
        SELECT
            s.userid,
            s.mode,
            count(*) AS count,
            SUM(s.score) AS total_score,
            SUM(s.n300 + s.n100 + s.n50 + (IF(s.mode IN (1, 3, 5), s.ngeki + s.nkatu, 0))) AS total_hits,
            SUM(s.time_elapsed) / 1000 AS play_time,
            MAX(s.max_combo) AS max_combo,
            SUM(s.grade = "XH") AS xh_count,
            SUM(s.grade = "X") AS x_count,
            SUM(s.grade = "SH") AS sh_count,
            SUM(s.grade = "S") AS s_count,
            SUM(s.grade = "A") AS a_count
        FROM
            scores s
        GROUP BY
            s.userid,
            s.mode
    )`

    const RANKED_STATS_CTES = /* sql */ `
    ranked_stats AS (
        SELECT
            s.userid,
            s.mode,
            SUM(s.score) AS ranked_score
        FROM
            scores s
            LEFT JOIN maps m ON s.map_md5 = m.md5
        WHERE
            m.status IN (2, 3)
            AND s.status = 2
        GROUP BY
            s.userid,
            s.mode
    )`

    const ctes: string[] = [
      'dummy AS (SELECT 1)',
      options.calcPP ? CALC_PP_CTES : undefined,
      options.slowStatistics ? CONCRETE_STATS_CTES : undefined,
      options.verySlowStatistics ? RANKED_STATS_CTES : undefined,
    ].filter(TSFilter)

    const joinTables: string[] = [
      options.calcPP ? 'LEFT JOIN calculated c ON s.id = c.userId AND s.mode = c.mode' : undefined,
      options.slowStatistics ? 'LEFT JOIN concrete_stats cs ON s.id = cs.userId AND s.mode = cs.mode' : undefined,
      options.verySlowStatistics ? 'LEFT JOIN ranked_stats rs ON s.id = rs.userId AND s.mode = rs.mode' : undefined,
    ].filter(TSFilter)

    const updates: string[] = [
      options.calcPP ? 's.pp = COALESCE(c.pp,0), s.acc = COALESCE(c.acc,0)' : undefined,
      options.slowStatistics
        ? [
            's.tscore = COALESCE(cs.total_score,0)',
            's.plays = COALESCE(cs.count,0)',
            's.playtime = COALESCE(cs.play_time,0)',
            's.max_combo = COALESCE(cs.max_combo,0)',
            's.total_hits = COALESCE(cs.total_hits,0)',
            's.xh_count = COALESCE(cs.xh_count,0)',
            's.x_count = COALESCE(cs.x_count,0)',
            's.sh_count = COALESCE(cs.sh_count,0)',
            's.s_count = COALESCE(cs.s_count,0)',
            's.a_count = COALESCE(cs.a_count,0)',
          ]
        : undefined,
      options.verySlowStatistics ? 's.rscore = COALESCE(rs.ranked_score,0)' : undefined,
    ].filter(TSFilter).flat()

    let query = /* sql */ `
      WITH ${ctes.join(',\n')}
      UPDATE stats s
      ${joinTables.length ? joinTables.join('\n') : ''}
      SET
        ${updates.join(',\n')}
      WHERE 1=1
    `
    if (options.modes && options.modes.length) {
      const modeList = options.modes.map(String).join(', ')
      query += `\nAND s.mode IN (${modeList})`
    }
    if (options.userIds && options.userIds.length) {
      const userIdList = options.userIds.map(String).join(', ')
      query += `\nAND s.id IN (${userIdList})`
    }

    await this.drizzle.execute(sql.raw(query))
  }
}
