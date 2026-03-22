import { type ExtractTablesWithRelations, and, eq, getTableName, gt, isNull, sql } from 'drizzle-orm'
import { type MySql2Database, type MySql2PreparedQueryHKT, type MySql2QueryResultHKT } from 'drizzle-orm/mysql2'
import { type MySqlTransaction } from 'drizzle-orm/mysql-core'
import { danSQLChunks } from '../../../utils/sql-dan'
import { BaseDanProcessor } from './$base'
import { type DanProvider } from '$base/server'
import { type TransformedUsecase, transformUsecase as compileDan } from '~/common/utils/dan'
import { type Cond, type Dan, type DatabaseDan, type DatabaseRequirementCondBinding, type Requirement, type RequirementCondBinding } from '~/def/dan'
import { type Id, type ScoreId } from '~/server/backend/bancho.py'
import { BanchoPyScoreStatus } from '~/server/backend/bancho.py/enums'
import * as schema from '~/server/backend/ppy.sb@bancho.py/drizzle/schema'

type Database = MySql2Database<typeof schema>

export class CacheSyncedDanProcessor extends BaseDanProcessor<Id, ScoreId> {
  dans = new Map<Id, DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>>()

  pipelines = new Map<Dan, TransformedUsecase<RequirementCondBinding<Requirement, Cond>>>()

  async init() {
    const dans = await this.dp.exportAll()
    for (const dan of dans) {
      this.dans.set(dan.id, dan)
    }

    this.logger.debug(`initialized ${this.dans.size} dan cache(s)`)
    this.rebuildDanPipelines()
  }

  #danTreeFullSimple = /* sql */`
  WITH RECURSIVE conds AS (
    SELECT
        dc.id,
        dc.id AS root,
        dc.type,
        dc.value,
        dc.parent
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
        child.parent
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
  virtualTableDanTreeSimpleAlias<T extends string>(name: T) {
    return {
      column: {
        id: sql.raw(`${name}.id`).mapWith(Number),
        root: sql.raw(`${name}.root`).mapWith(Number),
        parent: sql.raw(`${name}.parent`).mapWith(Number),
        type: sql.raw(`${name}.type`),
        value: sql.raw(`${name}.value`),
      },
      aliasedTable: sql.raw(`(${this.#danTreeFullSimple}) ${name}`),
      name,
    } as const
  }

  rebuildDanPipelines() {
    this.logger.debug({
      message: 'compiling dan pipelines...',
    })
    for (const [_, dan] of this.dans) {
      if (this.pipelines.has(dan)) {
        continue
      }
      this.pipelines.set(dan, compileDan(dan))
    }
  }

  async dbRunAll() {
    this.logger.debug({ message: 'calculating missed scores...' })
    await this.declarativeRecalc({})
  }

  async recalcDan(opt: DanProvider.RecalcQualifiedScoresParam<Id, ScoreId>, tx?: Database): Promise<void> {
    return this.declarativeRecalc({
      dans: opt.dan?.id ? [await this.getAndCache(opt.dan.id, tx)] : undefined,
      shouldRun: opt.dan
        ? (requirement, dan) => {
            const _dan = opt.dan!
            return dan.id === _dan.id && _dan.requirement ? _dan.requirement === requirement.type : true
          }
        : undefined,
    })
  }

  async recalcProvidedDan(opt: BaseDanProcessor.RecalcProvidedDanParam<Id, ScoreId>, tx?: Database): Promise<void> {
    return this.declarativeRecalc({
      dans: [opt.dan],
      qb: (q) => {
        if (opt.user) {
          q = q.where(eq(this.dp.tbl.scores.userId, opt.user.id))
        }
        return q
      },
    }, tx)
  }

  async declarativeRecalc(
    {
      dans = this.dans.values(),
      shouldRun,
      qb,
    }: {
      dans?: Iterable<DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>>
      shouldRun?: ShouldRun
      qb?: (q: QB) => QB
    },
    tx?: Database
  ): Promise<void> {
    const clearedScores: { scoreId: ScoreId; dan: number; requirement: Requirement }[] = []
    tx = tx || await this.getTx(this.dp.drizzle)
    for (const dan of dans) {
      for (const requirement of dan.requirements) {
        if (shouldRun && !shouldRun(requirement, dan)) {
          continue
        }
        const newScores = await (qb ? qb(this.recalcQB(requirement, dan, tx)) : this.recalcQB(requirement, dan, tx))

        if (!newScores.length) {
          continue
        }

        clearedScores.push(
          ...newScores.map(i => ({
            scoreId: i.scoreId,
            dan: dan.id,
            requirement: requirement.type,
          }))
        )
      }
    }

    if (!clearedScores.length) {
      return
    }

    await tx
      .insert(this.dp.tbl.requirementClearedScores)
      .values(clearedScores)
  }

  recalcQB(requirement: DatabaseRequirementCondBinding<Id, Requirement, Cond>, dan: DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>, tx: Database) {
    return tx
      .select({
        scoreId: this.dp.tbl.scores.id,
      })
      .from(this.dp.tbl.scores)
      .leftJoin(this.dp.tbl.patcherScoresMeta, eq(this.dp.tbl.scores.id, this.dp.tbl.patcherScoresMeta.id))
      .innerJoin(this.dp.tbl.beatmaps, eq(this.dp.tbl.scores.mapMd5, this.dp.tbl.beatmaps.md5))
      .leftJoin(this.dp.tbl.requirementClearedScores, and(
        eq(this.dp.tbl.requirementClearedScores.dan, dan.id),
        eq(this.dp.tbl.requirementClearedScores.requirement, requirement.type),
        eq(this.dp.tbl.scores.id, this.dp.tbl.requirementClearedScores.scoreId),
      ))
      .$dynamic()
      .where(
        and(
          gt(this.dp.tbl.scores.status, BanchoPyScoreStatus.DNF),
          danSQLChunks(requirement.cond, dan.requirements, this.dp.tbl),
          isNull(this.dp.tbl.requirementClearedScores.scoreId),
        )
      )
  }

  async getAndCache(id: Id, tx?: Database) {
    const dan = await this.dp.get(id, tx)
    this.dans.set(dan.id, dan)
    return dan
  }

  async dispose() {
  }

  getTx(db: typeof this.dp.drizzle): Promise<CacheSyncedDanProcessor.TX> {
    return new Promise(resolve => db.transaction(async tx => resolve(tx)))
  }

  onDanUpdated(dan: DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>) {
    this.logger.debug('dan updated, updating cache and pipeline')
    this.dans.set(dan.id, dan)
    this.pipelines.set(dan, compileDan(dan))
  }
}

export namespace CacheSyncedDanProcessor {
  export type TX = MySqlTransaction<MySql2QueryResultHKT, MySql2PreparedQueryHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>
}

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

type QB = ReturnType<InstanceType<typeof CacheSyncedDanProcessor>['recalcQB']>
type ShouldRun = (requirement: DatabaseRequirementCondBinding<Id, Requirement, Cond>, dan: DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>) => boolean
