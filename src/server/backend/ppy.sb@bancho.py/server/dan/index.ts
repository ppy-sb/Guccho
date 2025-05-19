import { type InferInsertModel, aliasedTable, and, asc, count, desc, eq, exists, getTableName, gt, inArray, isNotNull, isNull, like, ne, notExists, notInArray, or, sql } from 'drizzle-orm'
import { type MySql2Database } from 'drizzle-orm/mysql2'
import { danSQLChunks } from '../../utils/sql-dan'
import { type Id, type ScoreId, hasRuleset } from '../..'
import { BanchoPyScoreStatus } from '../../../bancho.py/enums'
import { useDrizzle, userPriv } from '../../../bancho.py/server/source/drizzle'
import {
  fromBanchoMode,
  fromBanchoPyMode,
  getModeAvailableRulesets,
  idToString,
  scoreIdToString,
  stringToId,
  stringToScoreId,
  toBanchoPyMode,
  toBeatmapset,
  toMods,
  toScore,
} from '../../../bancho.py/transforms'
import * as schema from '../../drizzle/schema'
import { RealtimeDanProcessor } from './processor/realtime'
import { IntervalDanProcessor } from './processor/interval'
import { NoopDanProcessor } from './processor/noop'
import { type BaseDanProcessor } from './processor/$base'
import { CacheSyncedDanProcessor } from './processor/$sync'
import { type UserCompact } from '~/def/user'
import { GucchoError } from '~/def/messages'
import {
  type ComparableNumericalScoreItem,
  CompareOP,
  type ComparisonCondition,
  type Cond,
  type Dan,
  type DatabaseDan,
  type DatabaseDanCourse,
  type DatabaseRequirementCondBinding,
  type EqualityCheck,
  OP,
  Requirement,
} from '~/def/dan'
import { DanProvider as Base } from '$base/server'
import { validateCond } from '~/common/utils/dan'
import { Mode, Ruleset } from '~/def'
import { config } from '$active/env'
import { type Grade } from '~/def/score'
import { type PaginatedResult } from '~/def/pagination'
import { assertNotReachable, pick } from '~/common/utils'

type Database = MySql2Database<typeof schema>

type InternalQueryDanRow = Awaited<ReturnType<DanProvider['_internal_queryDan']>['sql']>[number]

export class DanProvider extends Base<Id, ScoreId> {
  static readonly idToString = idToString
  static readonly stringToId = stringToId

  static readonly stringToScoreId = stringToScoreId
  static readonly scoreIdToString = scoreIdToString
  config = config()

  processor: BaseDanProcessor<Id, ScoreId> = this.config.dan
    ? this.config.dan.processor === 'realtime'
      ? new RealtimeDanProcessor(this)
      : new IntervalDanProcessor(this as DanProvider & { config: { dan: { interval: number } } } as DanProvider)
    : new NoopDanProcessor(this)

  readonly tbl = {
    users: schema.users,
    scores: schema.scores,
    beatmaps: schema.beatmaps,
    sources: schema.sources,
    patcherScoresMeta: schema.patcherScoresMeta,

    requirementClearedScores: schema.requirementClearedScores,

    dans: schema.dans,
    danCollections: schema.danCourses,
    danCollectionDans: schema.danCourseDans,
    danConds: schema.danConds,
    requirementCondBindings: schema.requirementCondBindings,
  }

  constructor() {
    super()
    this.processor.init()
  }

  drizzle = useDrizzle(schema)
  async get(id: Id, tx?: Database): Promise<DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>> {
    const { sql, table: { dans } } = this._internal_queryDan(tx)

    const result = await sql
      .where(eq(dans.id, id))
      .then(res => res[0])

    if (!result) {
      throwGucchoError(GucchoError.DanNotFound)
    }

    return this._internal_fromRowToDan(result)
  }

  async getDanWithRequirements(dan: {
    id: Id
    name: string
    createdAt: Date
    description: string | null
    creator?: Id | null
    updater?: Id | null
    updatedAt: Date
    requirements: {
      type: Requirement
      condId: Id
    }[]
  },
  tx?: Database
  ): Promise<DatabaseDan<Id>> {
    // Extract root condition IDs from requirements
    const rootCondIds = dan.requirements.map(r => r.condId)

    if (!tx) {
      tx = await this.getTx(this.drizzle)
    }

    const built = await this.#fetchAndBuildCondTree(rootCondIds, tx)

    const requirementsWithConds = dan.requirements.map((req) => {
      const cond = built[req.condId]
      if (!cond) {
        throw new Error(`Root condition with id ${req.condId} not found`)
      }
      return {
        ...req,
        dan: dan.id,
        type: req.type === 'pass' ? Requirement.Pass : Requirement.NoPause,
        cond,
      }
    })

    return {
      ...dan,
      description: dan.description ?? '',
      requirements: requirementsWithConds,
      creator: dan.creator ?? undefined,
      updater: dan.updater ?? undefined,
    }
  }

  async #fetchAndBuildCondTree(ids: Id[], tx: Database): Promise<Record<Id, Cond>> {
    if (!ids.length) {
      return {}
    }
    // Fetch all conditions starting from rootCondIds using a recursive CTE
    const [conditionsResult] = await tx.execute(
      sql`
      WITH RECURSIVE cond_tree AS (
        SELECT ${schema.danConds.id}, ${schema.danConds.type}, ${schema.danConds.value}, ${schema.danConds.parent}
        FROM ${schema.danConds}
        WHERE id IN ${ids}
        UNION ALL
        SELECT dc.id, dc.type, dc.value, dc.parent
        FROM ${schema.danConds} dc
        INNER JOIN cond_tree ct ON dc.parent = ct.id
      )
      SELECT id, type, value, parent
      FROM cond_tree
    `
    )

    return this.#buildCondTreeMem(ids, conditionsResult as unknown as DanCondRow[])
  }

  #buildCondTreeMem(ids: Id[], rows: DanCondRow[]) {
    // Build a map of conditions by id
    const condMap = new Map<number, CondNode>()
    for (const row of rows) {
      condMap.set(row.id, {
        id: row.id,
        type: row.type,
        value: row.value,
        parent: row.parent,
        children: [],
      })
    }

    // Build the tree by linking child conditions to their parents
    for (const cond of condMap.values()) {
      if (cond.parent !== 0 && condMap.has(cond.parent)) {
        const parentCond = condMap.get(cond.parent)
        parentCond?.children.push(cond)
      }
    }

    return Object.fromEntries(ids.map(id => [id, transformCond(condMap.get(id) ?? throwGucchoError(GucchoError.DanNotFound))]))
  }

  // TODO delete requirement
  async delete(id: number): Promise<void> {
    await this.drizzle.transaction(async (tx) => {
      await tx.delete(schema.requirementCondBindings).where(eq(schema.requirementCondBindings.danId, id))
      await tx.delete(schema.dans).where(eq(schema.dans.id, id))
    })
  }

  async search(a: Base.SearchDanParam<Id>): Promise<PaginatedResult<DatabaseDan<Id>>> {
    return this.drizzle.transaction<PaginatedResult<DatabaseDan<Id>>>(async (tx) => {
      const dans = aliasedTable(schema.dans, 'd')
      const condTree = this.#virtualTableDanTreeAlias('cond_tree')
      const danCondBinding = aliasedTable(schema.requirementCondBindings, 'dc')
      const bmId = aliasedTable(schema.beatmaps, 'b_id')
      const bmMd5 = aliasedTable(schema.beatmaps, 'b_md5')

      const _sql = tx
        .select({
          id: dans.id,
          name: dans.name,
          description: dans.description,
          creator: dans.creator,
          createdAt: dans.createdAt,
          updater: dans.updater,
          updatedAt: dans.updatedAt,
          total: sql<number>`count(*) over()`.as('total'),

          possibleBids: sql<Id[]>`
            CAST(
              CONCAT(
                '[',
                GROUP_CONCAT(
                  DISTINCT
                    CASE
                        WHEN ${bmId.id} THEN ${bmId.id}
                        ELSE ${bmMd5.id}
                    END
                ),
                ']'
              ) AS JSON
            )`.as('possible_bids'),

          requirements: sql<Array<[Requirement, Id]>>`
            CAST(
              CONCAT(
                '[',
                GROUP_CONCAT(
                  DISTINCT JSON_ARRAY(
                    ${danCondBinding.type},
                    ${danCondBinding.condId}
                  )
                ),
                ']'
              ) AS JSON
            )`.as('requirements'),

          fullTree: sql<Array<[Id, OP, string, Id]>>`JSON_ARRAYAGG(
              JSON_ARRAY(
                ${condTree.column.id},
                ${condTree.column.type},
                ${condTree.column.value},
                ${condTree.column.parent}
              )
            )`.as('full_tree'),
        })
        .from(dans)
        .leftJoin(schema.danCourseDans, eq(dans.id, schema.danCourseDans.danId))
        .leftJoin(schema.danCourses, eq(schema.danCourseDans.courseId, schema.danCourses.id))
        .innerJoin(danCondBinding, eq(dans.id, danCondBinding.danId))
        .innerJoin(condTree.aliasedTable, eq(danCondBinding.condId, condTree.column.root))
        .leftJoin(bmId, and(eq(condTree.column.type, sql.raw(`'${OP.BanchoBeatmapIdEq}'`)), eq(bmId.id, condTree.column.value), eq(bmId.server, sql.raw('\'osu!\''))))
        .leftJoin(bmMd5, and(eq(condTree.column.type, sql.raw(`'${OP.BeatmapMd5Eq}'`)), eq(bmMd5.md5, condTree.column.value)))
        .where(
          and(
            // keyword
            or(
              // search name
              like(dans.name, `%${a.keyword}%`),

              // search description
              like(dans.description, `%${a.keyword}%`),

              // search conditions
              and(
                // must be truthy conditions
                eq(condTree.column.truthy, sql.raw('1')),

                or(
                  // mode eq 'mania'
                  // bancho beatmap id eq
                  // beatmap md5 eq
                  and(
                    inArray(condTree.column.type, [
                      sql.raw(`'${OP.ModeEq}'`),
                      sql.raw(`'${OP.BanchoBeatmapIdEq}'`),
                      sql.raw(`'${OP.BeatmapMd5Eq}'`),
                    ]),
                    eq(condTree.column.value, a.keyword),
                  ),

                  // further search matched beatmaps
                  or(
                    like(bmId.artist, `%${a.keyword}%`),
                    like(bmId.title, `%${a.keyword}%`),
                    like(bmId.creator, `%${a.keyword}%`),
                    like(bmId.diff, `%${a.keyword}%`),
                    like(bmId.filename, `%${a.keyword}%`),
                    like(bmMd5.artist, `%${a.keyword}%`),
                    like(bmMd5.title, `%${a.keyword}%`),
                    like(bmMd5.creator, `%${a.keyword}%`),
                    like(bmMd5.diff, `%${a.keyword}%`),
                    like(bmMd5.filename, `%${a.keyword}%`),
                  ),
                )
              ),
            )
              ?.if(a.keyword),

            // filter mode
            exists(
              tx.select({ 1: sql`1` })
                .from(condTree.aliasedTable)
                .where(
                  and(
                    eq(condTree.column.root, danCondBinding.condId),
                    eq(condTree.column.type, sql.raw(`'${OP.ModeEq}'`)),
                    eq(condTree.column.value, a.mode),
                    eq(condTree.column.truthy, sql.raw('1')),
                  ),
                )
            )
              ?.if(a.mode),

            // filter ruleset
            exists(
              tx.select({ 1: sql`1` })
                .from(condTree.aliasedTable)
                .where(
                  and(
                    eq(condTree.column.root, danCondBinding.condId),
                    eq(condTree.column.truthy, sql.raw('1')),
                    eq(condTree.column.type, sql.raw(`'${OP.RulesetEq}'`)),
                    eq(condTree.column.value, a.ruleset),
                  ),
                )
            )
              // Mania only supports standard ruleset so ruleset is not required
              ?.if(a.mode !== Mode.Mania)
              ?.if(a.ruleset)
              ?.if(!((a.rulesetDefaultsToStandard && a.ruleset === Ruleset.Standard)))
              // validate ruleset and server support status
              ?.if(
                (a.mode && a.ruleset)
                  ? hasRuleset(a.mode, a.ruleset)
                  : true
              ),

            // filter key count
            or(
              eq(bmId.cs, a.mania!.keyCount!),
              eq(bmMd5.cs, a.mania!.keyCount!)
            )
              ?.if(a.mode === Mode.Mania)
              ?.if(a.mania?.keyCount),

            // management options

            // exclude dan course
            ne(schema.danCourses.id, a.excludeDanCourse!)
              ?.if(!a.danglingOnly)
              ?.if(a.excludeDanCourse !== undefined),

            // exclude dans
            notInArray(dans.id, a.excludeDans!)
              ?.if(!a.danglingOnly)
              ?.if(a.excludeDans?.length),

            // dangling only
            isNull(schema.danCourseDans.courseId)
              ?.if(a.danglingOnly),
          )
        )
        .groupBy(dans.id)
        .orderBy(
          desc(dans.updatedAt),
          desc(dans.id),
        )
        .limit(a.perPage)
        .offset(a.page * a.perPage)

      try {
        const result = await _sql

        if (!result.length) {
          return {
            total: 0,
            data: [],
          } as PaginatedResult<DatabaseDan<Id>>
        }

        return {
          total: result[0].total,
          data: result.map((i) => {
            const conds = this.#buildCondTreeMem(
              i.requirements
                .map(([_, id]) => id),
              i.fullTree
                .map(([id, type, value, parent]) => ({ id, type, value, parent }))
                .toSorted((a, b) => a.id - b.id)
            )

            return {
              ...pick(i, ['id', 'name', 'description']),
              creator: i.creator ?? undefined,
              updater: i.updater ?? undefined,
              createdAt: i.createdAt,
              updatedAt: i.updatedAt,
              requirements: i.requirements.map(([type, rootCond]) => {
                return {
                  type,
                  cond: conds[rootCond],
                }
              }),
            }
          }),
        } satisfies PaginatedResult<DatabaseDan<Id>>
      }
      catch (e) {
        console.error(e)
        throw e
      }
    })
  }

  readonly #preparedClearedScores = this.drizzle.select({
    score: schema.scores,
    beatmap: schema.beatmaps,
    source: schema.sources,
    dan: schema.dans,
    requirement: schema.requirementCondBindings,
  })
    .from(schema.scores)
    .innerJoin(schema.beatmaps, eq(schema.scores.mapMd5, schema.beatmaps.md5))
    .innerJoin(schema.sources, and(
      eq(schema.beatmaps.setId, schema.sources.id),
      eq(schema.beatmaps.server, schema.sources.server)
    ))
    .innerJoin(schema.requirementClearedScores, eq(schema.scores.id, schema.requirementClearedScores.scoreId))
    .innerJoin(schema.requirementCondBindings, and(
      eq(schema.requirementClearedScores.dan, schema.requirementCondBindings.danId),
      eq(schema.requirementClearedScores.requirement, schema.requirementCondBindings.type),
    ))
    .innerJoin(schema.dans, eq(schema.requirementCondBindings.danId, schema.dans.id))
    // .innerJoin(schema.danConds, eq(schema.requirementCondBindings.condId, schema.danConds.id))
    .where(({ dan }) => eq(dan.id, sql.placeholder('danId')))
    .limit(100)
    .prepare()

  async clearedScores(a: Id) {
    const data = await this.#preparedClearedScores.execute({ danId: a })

    return data.map(({ score, source, beatmap, dan, requirement }) => {
      const [mode, ruleset] = fromBanchoPyMode(score.mode)
      return {
        score: toScore({ score, beatmap, mode, ruleset, source }),
        dan,
        requirement,
      }
    })
  }

  userClearedScoresQuery(opt: { user: { id: Id } } & Base.ModeRulesetSelector) {
    // derived tables
    const s1 = aliasedTable(schema.scores, 's1')

    const sq = this.drizzle.select({
      ...pick(s1, ['id', 'mode', 'accuracy', 'score', 'pp', 'maxCombo', 'grade', 'mapMd5', 'userId', 'mods', 'playTime']) as Pick<typeof s1, 'id' | 'mode' | 'accuracy' | 'score' | 'pp' | 'maxCombo' | 'grade' | 'mapMd5' | 'userId' | 'mods' | 'playTime'>,
      rn: sql`rank() over (partition by ${s1.mode}, ${s1.mapMd5}, ${s1.userId} order by ${s1.score} desc)`.as('rn'),
    })
      .from(s1)
      .as('sq')

    return this.drizzle.select({
      dan: {
        id: schema.dans.id,
        name: schema.dans.name,
      },
      requirements: sql<Requirement[]>`JSON_ARRAYAGG(${schema.requirementCondBindings.type})`.as('requirements'),
      score: {
        id: sq.id,
        mode: sq.mode,
        accuracy: sq.accuracy,
        score: sq.score,
        pp: sq.pp,
        maxCombo: sq.maxCombo,
        grade: sq.grade,
        mods: sq.mods,
        playedAt: sq.playTime,
      },
      beatmap: {
        mode: schema.beatmaps.mode,
        id: schema.beatmaps.id,
        md5: schema.beatmaps.md5,
        creator: schema.beatmaps.creator,
        version: schema.beatmaps.version,
        diff: schema.beatmaps.diff,
        lastUpdate: schema.beatmaps.lastUpdate,
      },

      beatmapset: {
        id: schema.beatmaps.setId,
        artist: schema.beatmaps.artist,
        title: schema.beatmaps.title,
        source: schema.beatmaps.server,
      },

    })
      .from(schema.requirementClearedScores)
      .innerJoin(schema.requirementCondBindings, and(
        eq(schema.requirementClearedScores.dan, schema.requirementCondBindings.danId),
        eq(schema.requirementClearedScores.requirement, schema.requirementCondBindings.type),
      ))
      .innerJoin(schema.dans, eq(schema.requirementCondBindings.danId, schema.dans.id))
      .innerJoin(sq, eq(schema.requirementClearedScores.scoreId, sq.id))
      .innerJoin(schema.beatmaps, eq(sq.mapMd5, schema.beatmaps.md5))
      .groupBy(schema.dans.id, sq.id)
      .where(and(
        eq(sq.userId, opt.user.id),
        eq(sq.rn, sql.raw('1')),

        opt.mode
          ? opt.ruleset
            ? eq(sq.mode, toBanchoPyMode(opt.mode, opt.ruleset))
            : inArray(sq.mode, getModeAvailableRulesets(opt.mode).map(v => toBanchoPyMode(opt.mode!, v)))
          : undefined,

        opt.mode === Mode.Mania && opt.mania?.keyCount
          ? eq(schema.beatmaps.cs, opt.mania.keyCount)
          : undefined

      ))
  }

  async countUserClearedDans(opt: { user: Pick<UserCompact<number>, 'id'> } & Base.ModeRulesetSelector): Promise<number> {
    return this.drizzle.$count(
      this.drizzle
        .selectDistinct({ dan: schema.requirementClearedScores.dan })
        .from(schema.requirementClearedScores)
        .innerJoin(schema.scores, eq(schema.requirementClearedScores.scoreId, schema.scores.id))
        .innerJoin(schema.beatmaps, eq(schema.scores.mapMd5, schema.beatmaps.md5))
        .where(
          and(
            eq(schema.scores.userId, opt.user.id),

            opt.mode
              ? opt.ruleset
                ? eq(schema.scores.mode, toBanchoPyMode(opt.mode, opt.ruleset))
                : inArray(schema.scores.mode, getModeAvailableRulesets(opt.mode).map(v => toBanchoPyMode(opt.mode!, v)))
              : undefined,

            opt.mode === Mode.Mania && opt.mania?.keyCount
              ? eq(schema.beatmaps.cs, opt.mania.keyCount)
              : undefined
          )
        ).as('c')
    )
  }

  async getUserClearedDans(opt: { user: Pick<UserCompact<Id>, 'id'>; page: number; perPage?: number } & Base.ModeRulesetSelector): Promise<Array<Base.UserDanClearedScore<Id, ScoreId>>> {
    const res = await this.userClearedScoresQuery(opt)
      .orderBy(
        desc(schema.beatmaps.diff),
        desc(count(schema.requirementCondBindings.type)),
      )

    return res.map((i) => {
      const [mode, ruleset] = fromBanchoPyMode(i.score.mode)
      return {
        dan: i.dan,
        requirements: i.requirements,
        score: {
          ...i.score,
          mods: toMods(i.score.mods),
          mode,
          ruleset,
          score: BigInt(i.score.score),
          beatmap: {
            ...i.beatmap,
            mode: fromBanchoMode(i.beatmap.mode),
            beatmapset: toBeatmapset({
              id: i.beatmapset.id,
              server: 'osu!',
            }, i.beatmapset),
          },
          grade: (i.score.grade === 'N' ? 'F' : i.score.grade) as Grade,
        },
      } satisfies Base.UserDanClearedScore<Id, ScoreId>
    })
  }

  async recalcQualifiedScores(opt: Base.RecalcQualifiedScoresParam<Id, ScoreId>, tx?: Database): Promise<void> {
    if (this.processor instanceof CacheSyncedDanProcessor) {
      return this.processor.recalcDan(opt, tx)
    }
    else {
      return this.processor.recalcDan(opt)
    }
  }

  async getQualifiedScores(opt: Base.GetQualifiedScoresParam<Id>): Promise<Base.RequirementQualifiedScore<Id, ScoreId>> {
    const { id, requirement, page, perPage } = opt

    let pickColumn
    switch (opt.pick) {
      case 'pp':
        pickColumn = this.tbl.scores.pp
        break
      case 'score':
        pickColumn = this.tbl.scores.score
        break
      case 'accuracy':
        pickColumn = this.tbl.scores.accuracy
        break
      case 'id':
      case undefined:
        pickColumn = this.tbl.scores.id
        break
      default:
        assertNotReachable(opt.pick)
    }

    const _sql = this.drizzle.select({
      player: {
        id: sql`${this.tbl.users.id}`.mapWith(Number).as('userId'),
        name: this.tbl.users.name,
      },
      score: {
        id: sql`${this.tbl.scores.id}`.mapWith(BigInt).as('scoreId'),
        accuracy: this.tbl.scores.accuracy,
        score: this.tbl.scores.score,
        pp: this.tbl.scores.pp,
      },
      beatmap: {
        id: sql`${this.tbl.beatmaps.id}`.mapWith(Number).as('bid'),
        md5: this.tbl.beatmaps.md5,
        title: this.tbl.beatmaps.title,
        artist: this.tbl.beatmaps.artist,
        version: this.tbl.beatmaps.version,
      },
      pickRn: (
        opt.pick
          ? sql`ROW_NUMBER() OVER (
            PARTITION BY ${this.tbl.scores.userId}, ${this.tbl.scores.mapMd5}, ${this.tbl.scores.mode}
            ORDER BY ${pickColumn} DESC, ${this.tbl.scores.id} ASC
          )`
          : sql.raw('1')
      ).as('pick'),
    })
      .from(this.tbl.requirementClearedScores)
      .innerJoin(this.tbl.scores, eq(this.tbl.requirementClearedScores.scoreId, this.tbl.scores.id))
      .innerJoin(this.tbl.beatmaps, eq(this.tbl.scores.mapMd5, this.tbl.beatmaps.md5))
      .innerJoin(this.tbl.users, eq(this.tbl.scores.userId, this.tbl.users.id))
      .where(
        and(
          eq(this.tbl.requirementClearedScores.dan, id),
          eq(this.tbl.requirementClearedScores.requirement, requirement),
          userPriv(this.tbl.users)
        )
      )

    const count = await this.drizzle.$count(_sql.as('c'))

    if (count === 0) {
      return {
        count: 0,
        scores: [],
      }
    }

    const _sq = this.drizzle.$with('sq').as(_sql)

    let orderColumn
    switch (opt.orderBy?.[0]) {
      case 'pp':
        orderColumn = _sq.score.pp
        break
      case 'score':
        orderColumn = _sq.score.score
        break
      case 'accuracy':
        orderColumn = _sq.score.accuracy
        break
      case 'id':
      case undefined:
        orderColumn = _sq.score.id
        break
      default:
        assertNotReachable(opt.orderBy![0])
    }

    const res = await this.drizzle
      .with(_sq)
      .select({
        player: {
          id: _sq.player.id,
          name: _sq.player.name,
        },
        score: {
          id: _sq.score.id,
          accuracy: _sq.score.accuracy,
          score: _sq.score.score,
        },
        beatmap: {
          id: _sq.beatmap.id,
          md5: _sq.beatmap.md5,
          title: _sq.beatmap.title,
          artist: _sq.beatmap.artist,
          version: _sq.beatmap.version,
        },
      }).from(_sq)
      .where(
        eq(_sq.pickRn, sql`1`)
      )
      .orderBy(
        opt.orderBy
          ? opt.orderBy[1] === 'asc'
            ? asc(orderColumn)
            : desc(orderColumn)
          : asc(orderColumn)
      )
      .offset(perPage * page)
      .limit(perPage)

    return {
      count,
      scores: res,
    }
  }

  async runCustomDan(opt: Dan): Promise<Array<Base.RequirementQualifiedScore<Id, ScoreId>>> {
    return await this.drizzle.transaction(async (tx) => {
      const q = tx.select({
        player: {
          id: this.tbl.users.id,
          name: this.tbl.users.name,
        },
        score: {
          id: this.tbl.scores.id,
          accuracy: this.tbl.scores.accuracy,
          score: this.tbl.scores.score,
        },
        beatmap: {
          id: this.tbl.beatmaps.id,
          md5: this.tbl.beatmaps.md5,
          title: this.tbl.beatmaps.title,
          artist: this.tbl.beatmaps.artist,
          version: this.tbl.beatmaps.version,
        },
      })
        .from(this.tbl.scores)
        .leftJoin(this.tbl.patcherScoresMeta, eq(this.tbl.scores.id, this.tbl.patcherScoresMeta.id))
        .innerJoin(this.tbl.beatmaps, eq(this.tbl.scores.mapMd5, this.tbl.beatmaps.md5))
        .innerJoin(this.tbl.users, eq(this.tbl.scores.userId, this.tbl.users.id))

      // opt.requirements.sort((a, b) => b.type === Requirement.NoPause ? -1 : 1)

      return await Promise.all(
        opt.requirements.map(async (a) => {
          const _count = await tx
            .select({ count: count() })
            .from(this.tbl.scores)
            .leftJoin(this.tbl.patcherScoresMeta, eq(this.tbl.scores.id, this.tbl.patcherScoresMeta.id))
            .innerJoin(this.tbl.beatmaps, eq(this.tbl.scores.mapMd5, this.tbl.beatmaps.md5))
            .innerJoin(this.tbl.users, eq(this.tbl.scores.userId, this.tbl.users.id))
            .where(
              and(
                gt(this.tbl.scores.status, BanchoPyScoreStatus.DNF),
                danSQLChunks(a.cond, opt.requirements, this.tbl),
                userPriv(this.tbl.users)
              )
            )
            .limit(1)
            .then(res => res[0].count)

          if (!_count) {
            return { requirement: a.type, count: 0, scores: [] }
          }

          const _sql = q
            .where(
              and(
                gt(this.tbl.scores.status, BanchoPyScoreStatus.DNF),
                danSQLChunks(a.cond, opt.requirements, this.tbl),
                userPriv(this.tbl.users),
              )
            )
            .orderBy(desc(this.tbl.scores.score))
            .limit(10)

          return {
            requirement: a.type,
            count: _count,
            scores: await _sql,
          }
        }
        )
      )
    })
  }

  // TODO process old scores after saving
  async saveComposed(
    i: Dan | DatabaseDan<Id>,
    u: Pick<UserCompact<Id>, 'id'>
  ): Promise<DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>> {
    return await this.drizzle.transaction(async (tx) => {
      // 1. Insert or update the dan record
      const [result] = await tx
        .insert(schema.dans)
        .values({
          id: 'id' in i ? i.id : undefined,
          name: i.name,
          description: i.description,
          creator: 'creator' in i ? i.creator : u.id,
          updater: u.id,
          // updater: 'updater' in i ? i.updater : u.id,
          createdAt: 'createdAt' in i ? new Date(i.createdAt) : undefined,
          // updatedAt: 'updatedAt' in i ? i.updatedAt : undefined,
        })
        .onDuplicateKeyUpdate({
          set: {
            updater: u.id,
            name: i.name,
            description: i.description,
          },
        })

      const id = (i as DatabaseDan<Id>).id ?? result.insertId
      if (!id) {
        throw new Error(`Failed to save Dan with requirements: ${JSON.stringify(i.requirements)}`)
      }

      // 2. Fetch and delete existing requirement bindings and conditions
      const existingBindings = await tx
        .select({ condId: schema.requirementCondBindings.condId })
        .from(schema.requirementCondBindings)
        .where(eq(schema.requirementCondBindings.danId, id))

      const oldCondIds = existingBindings.map(binding => binding.condId)

      // Delete old conditions recursively
      for (const oldCondId of oldCondIds) {
        await this.deleteCondNodeWithChildren(oldCondId, tx)
      }

      const types: InferInsertModel<typeof schema.requirementCondBindings>[] = []

      // 2.5. delete obsolete requirement cleared scores
      await tx
        .delete(schema.requirementClearedScores)
        .where(
          eq(schema.requirementClearedScores.dan, id)
        )

      // 3. Save new conditions and their tree structures
      for (const r of i.requirements) {
        // Validate the condition
        r.cond = validateCond(r.cond)

        // Recursively save the condition tree and get the root condition ID
        const rootCondId = await this.saveCondTree(r.cond, tx, null)

        if (!rootCondId) {
          throw new Error(`Failed to save cond: ${JSON.stringify(r.cond)}`)
        }

        types.push({
          danId: id,
          condId: rootCondId,
          type: r.type,
        })
      }

      // 4. Link the root condition to the dan via requirement_cond_bindings
      await tx
        .insert(schema.requirementCondBindings)
        .values(types)
        // requires uniqueIndex(danId, type)
        .onDuplicateKeyUpdate({
          set: {
            condId: sql`values(${schema.requirementCondBindings.condId})`,
          },
        })

      // 5. Return the updated dan object
      const newDan = await this.get(id, tx)

      // 5.1 run cond and save scores
      if (this.processor instanceof CacheSyncedDanProcessor) {
        await this.processor.recalcProvidedDan({ dan: newDan }, tx)
      }
      else {
        setTimeout(() => this.processor.recalcProvidedDan({ dan: newDan }), 100)
      }

      return newDan
    }).catch((e) => {
      console.error(e)
      throw e
    })
  }

  private async saveCondTree(
    cond: Cond,
    tx: Database,
    parentId: number | null
  ): Promise<number> {
    switch (cond.type) {
      case OP.AND:
      case OP.OR: {
        // Insert current condition node
        const [res] = await tx
          .insert(schema.danConds)
          .values({
            type: cond.type,
            value: '', // No value for 'and' or 'or'
            parent: parentId,
          })

        const currentId = res.insertId
        if (!currentId) {
          throw new Error(`Failed to insert condition of type ${cond.type}`)
        }

        // Recursively save child conditions
        for (const childCond of cond.cond) {
          await this.saveCondTree(childCond, tx, currentId)
        }

        return currentId
      }
      case OP.NOT: {
        if (!cond.cond) {
          throw new Error('\'not\' operator must have exactly one child')
        }
        // Insert current condition node
        const [res] = await tx
          .insert(schema.danConds)
          .values({
            type: cond.type,
            value: '', // No value for 'not'
            parent: parentId,
          })

        const currentId = res.insertId
        if (!currentId) {
          throw new Error(`Failed to insert condition of type ${cond.type}`)
        }

        // Recursively save the single child condition
        await this.saveCondTree(cond.cond, tx, currentId)

        return currentId
      }
      case OP.Remark: {
        if (!cond.cond) {
          throw new Error('\'remark\' operator must have exactly one child')
        }
        // Insert current condition node
        const [res] = await tx
          .insert(schema.danConds)
          .values({
            type: cond.type,
            value: cond.remark, // Store remark in 'value' field
            parent: parentId,
          })

        const currentId = res.insertId
        if (!currentId) {
          throw new Error(`Failed to insert condition of type ${cond.type}`)
        }

        // Recursively save the child condition
        await this.saveCondTree(cond.cond, tx, currentId)

        return currentId
      }
      case OP.NoPause: {
        // Leaf condition with no value
        const [res] = await tx
          .insert(schema.danConds)
          .values({
            type: cond.type,
            value: '', // No value for 'no-pause'
            parent: parentId,
          })

        const currentId = res.insertId
        if (!currentId) {
          throw new Error(`Failed to insert condition of type ${cond.type}`)
        }

        return currentId
      }
      case OP.Expect: {
        // Leaf condition with no value
        const [res] = await tx
          .insert(schema.danConds)
          .values({
            type: cond.type,
            value: cond.key,
            parent: parentId,
          })

        const currentId = res.insertId
        if (!currentId) {
          throw new Error(`Failed to insert condition of type ${cond.type}`)
        }
        await this.saveComparison(cond.val, tx, currentId)
        return currentId
      }
      case OP.AccGte:
        return this.saveCondTree({ type: OP.Expect, key: 'accuracy', val: { type: CompareOP.Gte, val: cond.val } }, tx, parentId)
      case OP.ScoreGte:
        return this.saveCondTree({ type: OP.Expect, key: 'score', val: { type: CompareOP.Gte, val: cond.val } }, tx, parentId)

      default: {
        let valueStr: string
        switch (cond.type) {
          case OP.BanchoBeatmapIdEq:
          case OP.StableModIncludeAny:
          case OP.StableModIncludeAll:
          case OP.Extends:
            valueStr = cond.val.toString()
            break
          case OP.ModeEq:
          case OP.RulesetEq:
            valueStr = cond.val as string
            break
          case OP.BeatmapMd5Eq:
            valueStr = cond.val
            break
          default:
            assertNotReachable(cond)
        }

        // Insert the leaf condition
        const [res] = await tx
          .insert(schema.danConds)
          .values({
            type: cond.type,
            value: valueStr,
            parent: parentId,
          })

        const currentId = res.insertId
        if (!currentId) {
          throw new Error(`Failed to insert condition of type ${cond.type}`)
        }

        return currentId
      }
    }
  }

  private async saveComparison(input: ComparisonCondition['val'], tx: Database, parentId: number): Promise<Id> {
    const [id] = await tx
      .insert(schema.danConds)
      .values({
        type: input.type,
        value: input.val.toString(),
        parent: parentId,
      })
    return id.insertId
  }

  private async deleteCondNodeWithChildren(condId: number, tx: Database): Promise<void> {
    try {
      const { column, aliasedTable } = this.#virtualTableDanTreeAlias('c')
      await tx
        .delete(schema.danConds)
        .where(
          inArray(schema.danConds.id,
            tx
              .select({ id: column.id })
              .from(aliasedTable)
              .where(
                eq(column.root, condId)
              )
          )
        )
    }
    catch (e) {
      console.error(e)
    }
  }

  // id | root | type | value | parent | depth | truthy | effective_type
  #danTreeRecursive = /* sql */`
  WITH RECURSIVE conds AS (
    SELECT
        dc.id,
        dc.id AS root,
        dc.type,
        dc.value,
        dc.parent,
        0 AS depth,
        1 AS truthy,
        dc.type AS effective_type
    FROM
        ${getTableName(schema.danConds)} dc
    WHERE
        dc.parent IS NULL
    UNION ALL
    SELECT
        child.id,
        conds.root,
        child.type,
        child.value,
        child.parent,
        conds.depth + 1,
        CASE
            WHEN conds.type = 'not' THEN conds.truthy - 1
            ELSE conds.truthy
        END AS truthy,
        CASE
            WHEN MOD(
                CASE
                    WHEN conds.type = 'not' THEN conds.truthy - 1
                    ELSE conds.truthy
                END,
                2
            ) = 1
            AND child.type IN (
                'and',
                'or'
            ) THEN CASE
                WHEN child.type = 'and' THEN 'or'
                WHEN child.type = 'or' THEN 'and'
                ELSE child.type
            END
            ELSE child.type
        END AS effective_type
    FROM
        conds
        JOIN ${getTableName(schema.danConds)} child
        ON child.parent = conds.id
)
SELECT
    *
FROM
    conds
  `

  // TODO deprecate after drizzle supports withRecursive
  #virtualTableDanTreeAlias<T extends string>(name: T) {
    return {
      column: {
        id: sql.raw(`${name}.id`).mapWith(Number),
        root: sql.raw(`${name}.root`).mapWith(Number),
        parent: sql.raw(`${name}.parent`).mapWith(Number),
        type: sql.raw(`${name}.type`),
        value: sql.raw(`${name}.value`),
        truthy: sql.raw(`${name}.truthy`).mapWith(Boolean),
        effectiveType: sql.raw(`${name}.effective_type`),
      },
      aliasedTable: sql.raw(`(${this.#danTreeRecursive}) ${name}`),
      name,
    } as const
  }

  async exportAll(): Promise<DatabaseDan<Id, DatabaseRequirementCondBinding<number, Requirement, Cond>>[]> {
    const { sql } = this._internal_queryDan()

    const res = await sql
    return res.map((result) => {
      return this._internal_fromRowToDan(result)
    })
  }

  _internal_fromRowToDan(row: InternalQueryDanRow, optionalBuiltConds?: Record<string, Cond>): DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>> {
    const conds = optionalBuiltConds || this.#buildCondTreeMem(
      row.requirements
        .map(([_, id]) => id),
      row.fullTree
        .map(([id, type, value, parent]) => ({ id, type, value, parent }))
        .toSorted((a, b) => a.id - b.id)
    )

    return {
      ...pick(row, ['id', 'name', 'description']),
      creator: row.creator ?? undefined,
      updater: row.updater ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      requirements: row.requirements.map(([type, rootCond]) => {
        return {
          type,
          cond: conds[rootCond],
        }
      }),
    }
  }

  _internal_queryDan(tx?: Database) {
    const dans = aliasedTable(schema.dans, 'd')
    const condTree = this.#virtualTableDanTreeAlias('cond_tree')
    const danCondBinding = aliasedTable(schema.requirementCondBindings, 'dc')

    if (!tx) {
      tx = this.drizzle
    }

    const _sql = tx
      .select({
        id: dans.id,
        name: dans.name,
        description: dans.description,
        creator: dans.creator,
        createdAt: dans.createdAt,
        updater: dans.updater,
        updatedAt: dans.updatedAt,

        requirements: sql<Array<[Requirement, Id]>>`
            CAST(
              CONCAT(
                '[',
                GROUP_CONCAT(
                  DISTINCT JSON_ARRAY(
                    ${danCondBinding.type},
                    ${danCondBinding.condId}
                  )
                ),
                ']'
              ) AS JSON
            )`.as('requirements'),

        fullTree: sql<Array<[Id, OP, string, Id]>>`JSON_ARRAYAGG(
              JSON_ARRAY(
                ${condTree.column.id},
                ${condTree.column.type},
                ${condTree.column.value},
                ${condTree.column.parent}
              )
            )`.as('full_tree'),
      })
      .from(dans)
      .innerJoin(danCondBinding, eq(dans.id, danCondBinding.danId))
      .innerJoin(condTree.aliasedTable, eq(danCondBinding.condId, condTree.column.root))
      .groupBy(dans.id)

    return {
      sql: _sql,
      table: {
        dans,
        condTree,
        danCondBinding,
      },
    }
  }

  async searchCourses(a: Base.SearchDanCourseParam): Promise<PaginatedResult<DatabaseDanCourse<Id>>> {
    return this.drizzle.transaction<PaginatedResult<DatabaseDanCourse<Id>>>(async (tx) => {
      const courses = aliasedTable(schema.danCourses, 'c')
      const courseDans = aliasedTable(schema.danCourseDans, 'cd')
      const dans = aliasedTable(schema.dans, 'd')
      const condTree = this.#virtualTableDanTreeAlias('cond_tree')
      const danCondBinding = aliasedTable(schema.requirementCondBindings, 'dc')
      const bmId = aliasedTable(schema.beatmaps, 'b_id')
      const bmMd5 = aliasedTable(schema.beatmaps, 'b_md5')

      // First, get the filtered collections with their dans
      const _sql = tx
        .select({
          id: courses.id,
          name: courses.name,
          description: courses.description,
          creator: courses.creator,
          createdAt: courses.createdAt,
          updater: courses.updater,
          updatedAt: courses.updatedAt,
          total: sql<number>`count(*) over()`.as('total'),
          dans: sql<Array<{ id: Id; s: string }>>`CAST( CONCAT( '[', GROUP_CONCAT(DISTINCT JSON_OBJECT('id', ${courseDans.danId}, 's', ${courseDans.shortName}) ORDER BY ${courseDans.order} ASC), ']' ) AS JSON)`.as('dan_ids'),
        })
        .from(courseDans)
        .innerJoin(dans, eq(courseDans.danId, dans.id))
        .innerJoin(courses, eq(courses.id, courseDans.courseId))
        .innerJoin(danCondBinding, eq(dans.id, danCondBinding.danId))
        .innerJoin(condTree.aliasedTable, eq(danCondBinding.condId, condTree.column.root))
        .leftJoin(bmId, and(eq(condTree.column.type, sql.raw(`'${OP.BanchoBeatmapIdEq}'`)), eq(bmId.id, condTree.column.value), eq(bmId.server, sql.raw('\'osu!\''))))
        .leftJoin(bmMd5, and(eq(condTree.column.type, sql.raw(`'${OP.BeatmapMd5Eq}'`)), eq(bmMd5.md5, condTree.column.value)))
        .where(
          and(
            // show empty?
            isNotNull(dans.id)?.if(!a.allowEmpty),

            // keyword
            or(
              // search collection name
              like(courses.name, `%${a.keyword}%`),

              // search collection description
              like(courses.description, `%${a.keyword}%`),

              // search dan names
              like(dans.name, `%${a.keyword}%`),

              // search dan descriptions
              like(dans.description, `%${a.keyword}%`),

              // search conditions
              and(
                // must be truthy conditions
                eq(condTree.column.truthy, sql.raw('1')),

                or(
                  // mode eq 'mania'
                  // bancho beatmap id eq
                  // beatmap md5 eq
                  and(
                    inArray(condTree.column.type, [
                      sql.raw(`'${OP.ModeEq}'`),
                      sql.raw(`'${OP.BanchoBeatmapIdEq}'`),
                      sql.raw(`'${OP.BeatmapMd5Eq}'`),
                    ]),
                    eq(condTree.column.value, a.keyword),
                  ),

                  // further search matched beatmaps
                  or(
                    like(bmId.artist, `%${a.keyword}%`),
                    like(bmId.title, `%${a.keyword}%`),
                    like(bmId.creator, `%${a.keyword}%`),
                    like(bmId.diff, `%${a.keyword}%`),
                    like(bmId.filename, `%${a.keyword}%`),
                    like(bmMd5.artist, `%${a.keyword}%`),
                    like(bmMd5.title, `%${a.keyword}%`),
                    like(bmMd5.creator, `%${a.keyword}%`),
                    like(bmMd5.diff, `%${a.keyword}%`),
                    like(bmMd5.filename, `%${a.keyword}%`),
                  ),
                )
              ),
            )
              ?.if(a.keyword),

            // filter mode
            exists(
              tx.select({ 1: sql`1` })
                .from(condTree.aliasedTable)
                .where(
                  and(
                    eq(condTree.column.root, danCondBinding.condId),
                    eq(condTree.column.type, sql.raw(`'${OP.ModeEq}'`)),
                    eq(condTree.column.value, a.mode),
                    eq(condTree.column.truthy, sql.raw('1')),
                  ),
                )
            )
              ?.if(a.mode),

            // filter ruleset
            exists(
              tx.select({ 1: sql`1` })
                .from(condTree.aliasedTable)
                .where(
                  and(
                    eq(condTree.column.root, danCondBinding.condId),
                    eq(condTree.column.truthy, sql.raw('1')),
                    eq(condTree.column.type, sql.raw(`'${OP.RulesetEq}'`)),
                    eq(condTree.column.value, a.ruleset),
                  ),
                )
            )
              ?.if(a.ruleset)
              ?.if(!((a.rulesetDefaultsToStandard && a.ruleset === Ruleset.Standard)))
              // validate ruleset and server support status
              ?.if(
                (a.mode && a.ruleset)
                  ? hasRuleset(a.mode, a.ruleset)
                  : true
              )
              // Mania only supports standard ruleset so ruleset is not required
              ?.if(a.mode !== Mode.Mania),

            // filter key count
            (a.mode === Mode.Mania && a.mania?.keyCount)
              ? or(
                eq(bmId.cs, a.mania?.keyCount),
                eq(bmMd5.cs, a.mania?.keyCount)
              )
              : undefined
          )
        )
        .groupBy(courses.id)
        .orderBy(
          desc(courses.updatedAt),
          desc(courses.id),
        )
        .limit(a.perPage)
        .offset(a.page * a.perPage)

      try {
        const result = await _sql

        if (!result.length) {
          return {
            total: 0,
            data: [],
          } as PaginatedResult<DatabaseDanCourse<Id>>
        }

        // Get all unique dan IDs from the results
        const allDanIds = new Set<Id>(result.flatMap(v => v.dans.map(d => d.id)))

        // Fetch all dans with their requirements
        const dansWithRequirements = await tx
          .select({
            id: dans.id,
            name: dans.name,
            description: dans.description,
            creator: dans.creator,
            createdAt: dans.createdAt,
            updater: dans.updater,
            updatedAt: dans.updatedAt,
            requirements: sql<Array<{ type: Requirement; rootCond: Id }>>`
              CAST(
                CONCAT(
                  '[',
                  GROUP_CONCAT(
                    DISTINCT JSON_OBJECT(
                      'type', ${danCondBinding.type},
                      'rootCond', ${danCondBinding.condId}
                    )
                  ),
                  ']'
                ) AS JSON
              )`.as('requirements'),
          })
          .from(dans)
          .innerJoin(danCondBinding, eq(dans.id, danCondBinding.danId))
          .where(inArray(dans.id, Array.from(allDanIds)))
          .groupBy(dans.id)

        // Create a map of dans by ID
        const dansMap = new Map<Id, typeof dansWithRequirements[number]>(dansWithRequirements.map(dan => [dan.id, dan]))

        // Fetch the condition tree for all requirements
        const allCondIds = dansWithRequirements.flatMap(d => d.requirements.map(r => r.rootCond))
        const condTree = await this.#fetchAndBuildCondTree(allCondIds, tx)

        // Build the final result
        return {
          total: result[0].total,
          data: result.map((i) => {
            const collectionDans = i.dans.filter(({ id }) => id !== null).map(({ id, s }) => {
              const dan = dansMap.get(id)
              if (!dan) {
                throw new Error(`Dan with id ${id} not found`)
              }
              return {
                ...pick(dan, ['id', 'name', 'description']),
                creator: dan.creator ?? undefined,
                updater: dan.updater ?? undefined,
                createdAt: dan.createdAt,
                updatedAt: dan.updatedAt,
                shortName: s,
                requirements: dan.requirements.map((req) => {
                  return {
                    type: req.type,
                    cond: condTree[req.rootCond],
                  }
                }),
              }
            })

            return {
              ...pick(i, ['id', 'name', 'description']),
              creator: i.creator ?? undefined,
              updater: i.updater ?? undefined,
              createdAt: i.createdAt,
              updatedAt: i.updatedAt,
              dans: collectionDans,
            }
          }),
        } as PaginatedResult<DatabaseDanCourse<Id>>
      }
      catch (e) {
        console.error(e)
        throw e
      }
    })
  }

  async getCourse(id: Id, tx?: Database): Promise<DatabaseDanCourse<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>> {
    if (!tx) {
      tx = await this.getTx(this.drizzle)
    }
    const course = await tx.query.danCourses.findFirst({
      where: eq(schema.danCourses.id, id),
    })

    if (!course) {
      throwGucchoError(GucchoError.DanCourseNotFound)
    }

    const dans = aliasedTable(schema.dans, 'd')
    const condTree = this.#virtualTableDanTreeAlias('cond_tree')
    const danCondBinding = aliasedTable(schema.requirementCondBindings, 'dc')

    const _sql = tx
      .select({
        shortName: schema.danCourseDans.shortName,
        id: dans.id,
        name: dans.name,
        description: dans.description,
        creator: dans.creator,
        createdAt: dans.createdAt,
        updater: dans.updater,
        updatedAt: dans.updatedAt,

        requirements: sql<Array<[Requirement, Id]>>`
          CAST(
            CONCAT(
              '[',
              GROUP_CONCAT(
                DISTINCT JSON_ARRAY(
                  ${danCondBinding.type},
                  ${danCondBinding.condId}
                )
              ),
              ']'
            ) AS JSON
          )`.as('requirements'),

        fullTree: sql<Array<[Id, OP, string, Id]>>`JSON_ARRAYAGG(
            JSON_ARRAY(
              ${condTree.column.id},
              ${condTree.column.type},
              ${condTree.column.value},
              ${condTree.column.parent}
            )
          )`.as('full_tree'),
      })
      .from(dans)
      .innerJoin(schema.danCourseDans, eq(dans.id, schema.danCourseDans.danId))
      .innerJoin(schema.danCourses, eq(schema.danCourseDans.courseId, schema.danCourses.id))
      .innerJoin(danCondBinding, eq(dans.id, danCondBinding.danId))
      .innerJoin(condTree.aliasedTable, eq(danCondBinding.condId, condTree.column.root))
      .groupBy(dans.id)
      .orderBy(
        asc(schema.danCourseDans.order),
      )
      .where(eq(schema.danCourses.id, id))

    try {
      const result = await _sql

      const dans = result.map((i) => {
        const conds = this.#buildCondTreeMem(
          i.requirements
            .map(([_, id]) => id),
          i.fullTree
            .map(([id, type, value, parent]) => ({ id, type, value, parent }))
            .toSorted((a, b) => a.id - b.id)
        )

        return {
          ...pick(i, ['id', 'name', 'description']),
          shortName: i.shortName ?? '',
          creator: i.creator ?? undefined,
          updater: i.updater ?? undefined,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
          requirements: i.requirements.map(([type, rootCond]) => {
            return {
              type,
              cond: conds[rootCond],
            }
          }),
        }
      })

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        dans,
      } satisfies DatabaseDanCourse<Id>
    }
    catch (e) {
      console.error(e)
      throw e
    }
  }

  async deleteCourse(opt: Base.DeleteDanCourseParam<Id>): Promise<void> {
    const danCourseDans = aliasedTable(schema.danCourseDans, 'dcd2')
    await this.drizzle.transaction(async (tx) => {
      const deleting = opt.deleteDans
        ? await tx.selectDistinct({ id: schema.danCourseDans.danId })
          .from(schema.danCourseDans)
          .where(
            and(
              eq(schema.danCourseDans.courseId, opt.id),
              notExists(
                tx.select()
                  .from(danCourseDans)
                  .where(
                    and(
                      eq(schema.danCourseDans.danId, danCourseDans.danId),
                      ne(danCourseDans.courseId, opt.id)
                    )
                  )
              )
            )
          )
        : undefined

      await tx
        .delete(schema.danCourses)
        .where(eq(schema.danCourses.id, opt.id))

      if (!opt.deleteDans) {
        return
      }

      console.warn('deleting dan', deleting)

      await tx
        .delete(schema.dans)
        .where(
          inArray(schema.dans.id, deleting!.map(i => i.id))
        )
    }).catch((e) => {
      console.error(e)
      throw e
    })
  }

  async createCourse(
    input: Base.CreateDanCourseParam,
    user: Pick<UserCompact<Id>, 'id'>
  ): Promise<Id> {
    return this.drizzle.transaction(async (tx) => {
      // 1. Insert the course
      const [result] = await tx
        .insert(schema.danCourses)
        .values({
          name: input.name,
          description: input.description,
          creator: user.id,
          updater: user.id,
        })

      const id = result.insertId
      if (!id) {
        throwGucchoError(GucchoError.CannotSaveDanCourse)
      }

      return id
    })
  }

  async updateCourse(
    input: Base.UpdateDanCourseParam<Id>,
    user: Pick<UserCompact<Id>, 'id'>
  ): Promise<DatabaseDanCourse<Id>> {
    return this.drizzle.transaction(async (tx) => {
      // 1. Update course name/description/updater
      await tx.update(schema.danCourses)
        .set({
          name: input.name,
          description: input.description,
          updater: user.id,
        })
        .where(eq(schema.danCourses.id, input.id))

      // 2. Remove all existing dans from the course
      await tx.delete(schema.danCourseDans)
        .where(eq(schema.danCourseDans.courseId, input.id))

      // 3. Insert new dans with shortNames
      if (input.dans?.length) {
        await tx.insert(schema.danCourseDans).values(
          input.dans.map((d, idx) => ({
            courseId: input.id,
            danId: d.id,
            order: idx,
            shortName: d.shortName,
          }))
        )
      }

      // 4. Return the updated course
      return this.getCourse(input.id, tx)
    })
  }

  getTx(db: typeof this.drizzle) {
    return new Promise<Database>(resolve => db.transaction(async tx => resolve(tx)))
  }
}

function transformCond(condNode: CondNode): Cond {
  const { type, value, children } = condNode

  switch (type) {
    case OP.AND:
    case OP.OR:
      return {
        type,
        cond: children.map(transformCond),
      }

    case OP.NOT: {
      if (children.length !== 1) {
        throw new Error('\'not\' operator must have exactly one child')
      }
      return {
        type,
        cond: transformCond(children[0]),
      }
    }

    case OP.Remark:
      return {
        type,
        remark: value,
        cond: transformCond(children[0]),
      } as Cond

    case OP.AccGte:
    case OP.StableModIncludeAny:
    case OP.StableModIncludeAll:
      // Leaf condition
      return {
        type,
        val: Number(value),
      }

    case OP.ModeEq:
      return {
        type,
        val: value as Mode,
      }

    case OP.RulesetEq:
      return {
        type,
        val: value as Ruleset,
      }

    case OP.Extends:
      return {
        type,
        val: value as Requirement,
      }

    case OP.ScoreGte:
      return {
        type,
        val: BigInt(value),
      }

    case OP.BeatmapMd5Eq:
    case OP.BanchoBeatmapIdEq:
      return {
        type,
        val: value,
      }
    case OP.NoPause:
      return {
        type,
      }

    case OP.Expect: {
      const child = transformComparison(children[0] as unknown as CondNodeCompare) as unknown as EqualityCheck<any>
      const _for_ts = value as ComparisonCondition['key']
      switch (_for_ts) {
        case 'mode':
          return {
            type,
            key: 'mode',
            val: child,
          }

        case 'ruleset':
          return {
            type,
            key: 'ruleset',
            val: child,
          }

        case 'score':
          return {
            type,
            key: 'score',
            val: {
              type: child.type,
              val: BigInt(child.val),
            },
          }

        case 'maxCombo':
        case 'accuracy':
        case 'count.miss':
        case 'count.50':
        case 'count.100':
        case 'count.300':
        case 'count.geki':
        case 'count.katu':
        case 'count.200':
        case 'count.max':
          return {
            type,
            key: value as ComparableNumericalScoreItem,
            val: {
              type: child.type,
              val: Number(child.val),
            },
          }

        default:
          assertNotReachable(_for_ts)
      }

      break
    }

    default:
      assertNotReachable(type)
  }
}

function transformComparison(condNode: CondNodeCompare): { type: ComparisonCondition['val']['type']; val: unknown } {
  const { type, value } = condNode
  switch (type) {
    case CompareOP.Gt:
    case CompareOP.Gte:
    case CompareOP.Lt:
    case CompareOP.Lte:
    case CompareOP.Eq:
    case CompareOP.Ne:
      return {
        type,
        val: value,
      }

    default:
      assertNotReachable(type)
  }
}

interface CondNode {
  id: number
  type: OP
  value: string
  parent: number
  children: CondNode[]
}
interface CondNodeCompare {
  id: number
  type: CompareOP
  value: string
  parent: number
}

interface DanCondRow {
  id: number
  type: OP
  value: string
  parent: number
}
