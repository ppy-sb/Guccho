import MySQLEvents, { type DeleteEvent, type InsertEvent, type UpdateEvent } from '@rodrigogs/mysql-events'
import { type InferSelectModel, and, eq, getTableName, gt, inArray, isNull, sql } from 'drizzle-orm'
import { type MySql2Database } from 'drizzle-orm/mysql2'
import { type DanProvider } from '../../../../$base/server'
import { danSQLChunks } from '../../../utils/sql-dan'
import { BaseDanProcessor } from './$base'
import { type Cond, type DatabaseDan, type DatabaseRequirementCondBinding, type Requirement } from '~/def/dan'
import { type Id, type ScoreId } from '~/server/backend/bancho.py'
import { BanchoPyScoreStatus } from '~/server/backend/bancho.py/enums'
import { watchTable } from '~/server/backend/bancho.py/server/event-sources/db'
import * as schema from '~/server/backend/ppy.sb@bancho.py/drizzle/schema'

type Database = MySql2Database<typeof schema>

export class CacheSyncedDanProcessor extends BaseDanProcessor<Id, ScoreId> {
  watchBindingsDeletion = watchTable(schema.requirementCondBindings, MySQLEvents.STATEMENTS.DELETE, this.onCondBindingDeleted.bind(this))
  watchBindingsInserted = watchTable(schema.requirementCondBindings, MySQLEvents.STATEMENTS.INSERT, this.onCondBindingUpserted.bind(this))
  watchBindingsUpdated = watchTable(schema.requirementCondBindings, MySQLEvents.STATEMENTS.UPDATE, this.onCondBindingUpserted.bind(this))
  watchDanCondChanges = watchTable(schema.danConds, MySQLEvents.STATEMENTS.UPDATE, this.onCondUpdated.bind(this))
  dans = new Map<Id, DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>>()

  async init() {
    const dans = await this.dp.exportAll()
    for (const dan of dans) {
      this.dans.set(dan.id, dan)
    }

    this.logger.debug(`initialized ${this.dans.size} dan cache(s)`)
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

  async onCondUpdated(row: UpdateEvent<InferSelectModel<typeof schema.danConds>>) {
    this.logger.debug('detected dan cond update, syncing')
    await this.dp.drizzle.transaction(async (tx) => {
      const condsRoot = this.virtualTableDanTreeSimpleAlias('r')
      const condsAfter = row.affectedRows.map(item => item.after)

      const newDanIds = await tx.selectDistinct({
        id: schema.dans.id,
      })
        .from(schema.dans)
        .innerJoin(schema.requirementCondBindings, eq(schema.requirementCondBindings.danId, schema.dans.id))
        .innerJoin(condsRoot.aliasedTable, eq(condsRoot.column.root, schema.requirementCondBindings.condId))
        .where(inArray(condsRoot.column.id, condsAfter.map(item => item.id)))

      const q = this.dp._internal_queryDan()
      const { sql, table } = q

      const dans = await sql.where(inArray(table.dans.id, newDanIds.map(item => item.id)))

      for (const dan of dans) {
        this.dans.set(dan.id, this.dp._internal_fromRowToDan(dan))
      }
      this.logger.debug(`synced dans: ${dans.map(item => item.id).join(', ')}`)
    })
  }

  onCondBindingDeleted(row: DeleteEvent<InferSelectModel<typeof schema.requirementCondBindings>>) {
    this.logger.debug('detected dan cond delete, removing from cache')
    const deleted = row.affectedRows.map(item => item.before.danId)

    for (const danId of deleted) {
      this.dans.delete(danId)
    }

    this.logger.debug(`removed from cache: ${deleted.join(', ')}`)
  }

  async onCondBindingUpserted(row: InsertEvent<InferSelectModel<typeof schema.requirementCondBindings>> | UpdateEvent<InferSelectModel<typeof schema.requirementCondBindings>>) {
    this.logger.debug('detected dan cond binding upserted, syncing')
    await this.dp.drizzle.transaction(async (tx) => {
      const ids = row.affectedRows.map(item => item.after.danId)
      const dan = await tx.query.dans.findMany({
        where: inArray(schema.dans.id, ids),
        with: {
          requirements: {
            columns: {
              type: true,
              condId: true,
            },
          },
        },
      })

      for (const d of dan) {
        this.dans.set(d.id, await this.dp.getDanWithRequirements(d, tx))
      }

      this.logger.debug(`synced dans: ${dan.map(item => item.id).join(', ')}`)
    })
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
    this.watchBindingsDeletion.dispose()
    this.watchDanCondChanges.dispose()
  }

  getTx(db: typeof this.dp.drizzle) {
    return new Promise<Database>(resolve => db.transaction(async tx => resolve(tx)))
  }
}

type QB = ReturnType<InstanceType<typeof CacheSyncedDanProcessor>['recalcQB']>
type ShouldRun = (requirement: DatabaseRequirementCondBinding<Id, Requirement, Cond>, dan: DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>) => boolean
