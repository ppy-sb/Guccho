import MySQLEvents, { type DeleteEvent, type InsertEvent, type UpdateEvent } from '@rodrigogs/mysql-events'
import { type InferSelectModel, eq, inArray } from 'drizzle-orm'
import { MapProvider, ScoreProvider } from '../..'
import { UserProvider } from '../../user'
import { CacheSyncedDanProcessor, wait } from './$sync'
import { transformUsecase as compileDan } from '~/common/utils/dan'
import { type AbnormalStatus, type NormalBeatmapWithMeta, RankingStatus } from '~/def/beatmap'
import { type Requirement } from '~/def/dan'
import { watchTable } from '~/server/backend/bancho.py/server/event-sources/db'
import { fromBanchoPyMode, toScore } from '~/server/backend/bancho.py/transforms'
import { type Id } from '~/server/backend/ppy.sb@bancho.py'
import * as schema from '~/server/backend/ppy.sb@bancho.py/drizzle/schema'

export class RealtimeDanProcessor extends CacheSyncedDanProcessor implements CacheSyncedDanProcessor {
  watchBindingsDeletion = watchTable(schema.requirementCondBindings, MySQLEvents.STATEMENTS.DELETE, this.onCondBindingDeleted.bind(this))
  watchBindingsInserted = watchTable(schema.requirementCondBindings, MySQLEvents.STATEMENTS.INSERT, this.onCondBindingUpserted.bind(this))
  watchBindingsUpdated = watchTable(schema.requirementCondBindings, MySQLEvents.STATEMENTS.UPDATE, this.onCondBindingUpserted.bind(this))
  watchDanCondChanges = watchTable(schema.danConds, MySQLEvents.STATEMENTS.UPDATE, this.onCondUpdated.bind(this))
  watchers: Array<ReturnType<typeof watchTable>> = []

  async init() {
    this.logger.warn('Realtime Dan processor is EXPERIMENTAL and may have bugs! Use at your own risk.')
    await super.init()

    this.watchers = [
      watchTable(schema.scores, MySQLEvents.STATEMENTS.INSERT, this.onScoreSubmitted.bind(this)),
      // watchTable(schema.scores, MySQLEvents.STATEMENTS.UPDATE, this.onScoreSubmitted.bind(this)),
    ]
  }

  async onScoreSubmitted(row: InsertEvent<InferSelectModel<typeof schema.scores>>) {
    const scores = row.affectedRows
      .map(item => item.after)
      .filter(item => item.grade !== 'F')

    // PRAY for patcher meta saved, since bpy submitModular is NOT USING A TRANSACTION !!!
    await wait(2000)

    const [beatmaps, users, patcherScoresMeta] = await Promise.all([
      this.dp.drizzle.query.beatmaps.findMany({
        where: inArray(schema.beatmaps.md5, scores.map(item => item.mapMd5)),
        with: {
          source: true,
        },
      }),
      this.dp.drizzle.query.users.findMany({
        where: inArray(schema.users.id, scores.map(item => item.userId)),
        columns: {
          id: true,
          name: true,
          safeName: true,
        },
      }),
      this.dp.drizzle.query.patcherScoresMeta.findMany({
        where: inArray(schema.patcherScoresMeta.id, scores.map(item => item.id)),
        columns: {
          id: true,
          noPause: true,
        },
      }),
    ])

    const inserting: {
      scoreId: bigint
      dan: number
      requirement: Requirement
    }[] = []

    for (const [_, dan] of this.dans) {
      const pipeline = this.pipelines.get(dan) || this.pipelines.set(dan, compileDan(dan)).get(dan)!

      for (const [score, meta] of zipById(scores, patcherScoresMeta)) {
        const bm = beatmaps.find(item => item.md5 === score.mapMd5)
        const [mode, ruleset] = fromBanchoPyMode(score.mode)
        if (!bm) {
          continue
        }

        const tScore = toScore({ score, beatmap: bm, mode, ruleset, source: bm.source })
        const _beatmap = tScore.beatmap

        if (_beatmap.status === RankingStatus.Deleted || _beatmap.status === RankingStatus.NotFound) {
          continue
        }
        const beatmap = _beatmap as NormalBeatmapWithMeta<Exclude<RankingStatus, AbnormalStatus>, Id, Id>
        // id keeps being string (weired)
        // eslint-disable-next-line eqeqeq
        const user = users.find(item => item.id == score.userId)

        if (!user) {
          this.logger.warn({
            message: 'score submitted with user not found',
            scoreId: ScoreProvider.scoreIdToString(score.id),
            userId: score.userId,
          })
          continue
        }

        const result = pipeline({
          ...tScore,
          id: ScoreProvider.scoreIdToString(score.id),
          beatmap: {
            ...beatmap,
            id: MapProvider.idToString(beatmap.id),
            foreignId: 'foreignId' in beatmap ? MapProvider.idToString(beatmap.foreignId) : undefined,
          } as unknown as NormalBeatmapWithMeta<Exclude<RankingStatus, AbnormalStatus>, string, string>,
          noPause: meta?.noPause ?? false,
          player: mapId(user, UserProvider.idToString),
        })

        const passed = result.map((item, idx) => [item, dan.requirements[idx]] as const).filter(([item]) => item.result)
        if (!passed.length) {
          continue
        }

        inserting.push(...passed.map(([_item, requirement]) => ({
          scoreId: score.id,
          dan: dan.id,
          requirement: requirement.type,
        })))
      }
    }

    if (!inserting.length) {
      return
    }
    await this.dp.drizzle.insert(schema.requirementClearedScores).values(inserting)
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
    this.rebuildDanPipelines()
  }

  onCondBindingDeleted(row: DeleteEvent<InferSelectModel<typeof schema.requirementCondBindings>>) {
    this.logger.debug('detected dan cond delete, removing from cache')
    const deleted = row.affectedRows.map(item => item.before.danId)

    for (const danId of deleted) {
      this.dans.delete(danId)
    }

    this.logger.debug(`removed from cache: ${deleted.join(', ')}`)

    this.rebuildDanPipelines()
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

    this.rebuildDanPipelines()
  }

  async dispose() {
    this.watchers.forEach(item => item.dispose())
    this.watchBindingsDeletion.dispose()
    this.watchDanCondChanges.dispose()
    super.dispose()
  }
}
function zipById<A extends { id: any }, B extends { id: any }>(lA: A[], lB: B[]): [A, B | undefined][] {
  return lA.map((a) => {
    const b = lB.find(b => b.id === a.id)
    return [a, b]
  })
}
