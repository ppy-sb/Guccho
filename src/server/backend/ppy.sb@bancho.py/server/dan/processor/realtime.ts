import MySQLEvents, { type DeleteEvent, type InsertEvent, type RowEvent, type UpdateEvent } from '@rodrigogs/mysql-events'
import { type InferSelectModel, inArray } from 'drizzle-orm'
import { CacheSyncedDanProcessor } from './$sync'
import { type TransformedUsecase, transformUsecase as compileDan } from '~/common/utils/dan'
import { type AbnormalStatus, type NormalBeatmapWithMeta, RankingStatus } from '~/def/beatmap'
import { type Cond, type Dan, type Requirement, type RequirementCondBinding } from '~/def/dan'
import { watchTable } from '~/server/backend/bancho.py/server/event-sources/db'
import { fromBanchoPyMode, toScore } from '~/server/backend/bancho.py/transforms'
import { type Id } from '~/server/backend/ppy.sb@bancho.py'
import * as schema from '~/server/backend/ppy.sb@bancho.py/drizzle/schema'

export class RealtimeDanProcessor extends CacheSyncedDanProcessor implements CacheSyncedDanProcessor {
  watchers: Array<ReturnType<typeof watchTable>> = []

  pipelines = new Map<Dan, TransformedUsecase<RequirementCondBinding<Requirement, Cond>>>()

  async init() {
    await super.init()
    this.rebuildDanPipelines()

    this.watchers = [
      watchTable(schema.scores, MySQLEvents.STATEMENTS.INSERT, this.onScoreSubmitted.bind(this)),
      watchTable(schema.scores, MySQLEvents.STATEMENTS.UPDATE, this.onScoreSubmitted.bind(this)),
    ]
  }

  async onScoreSubmitted(row: RowEvent<InferSelectModel<typeof schema.scores>>) {
    await wait(5000) // PRAY for patcher meta saved, since bpy submitModular is NOT USING A TRANSACTION !!!
    const scores = row.affectedRows.map(item => item.after).filter(item => item !== undefined)

    const beatmaps = await this.dp.drizzle.query.beatmaps.findMany({
      where: inArray(schema.beatmaps.md5, scores.map(item => item.mapMd5)),
      with: {
        source: true,
      },
    })
    const users = await this.dp.drizzle.query.users.findMany({
      where: inArray(schema.users.id, scores.map(item => item.userId)),
    })
    const patcherScoresMeta = await this.dp.drizzle.query.patcherScoresMeta.findMany({
      where: inArray(schema.patcherScoresMeta.id, scores.map(item => item.id)),
    })

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
        const beatmap = tScore.beatmap

        if (beatmap.status === RankingStatus.Deleted || beatmap.status === RankingStatus.NotFound) {
          continue
        }

        const result = pipeline({
          ...tScore,
          beatmap: beatmap as NormalBeatmapWithMeta<Exclude<RankingStatus, AbnormalStatus>, Id, Id>,
          noPause: meta?.noPause ?? false,
          player: users.find(item => item.id === score.userId)!,
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
    await super.onCondUpdated(row)
    this.rebuildDanPipelines()
  }

  onCondBindingDeleted(row: DeleteEvent<InferSelectModel<typeof schema.requirementCondBindings>>) {
    super.onCondBindingDeleted(row)
    this.rebuildDanPipelines()
  }

  async onCondBindingUpserted(row: InsertEvent<InferSelectModel<typeof schema.requirementCondBindings>> | UpdateEvent<InferSelectModel<typeof schema.requirementCondBindings>>) {
    await super.onCondBindingUpserted(row)
    this.rebuildDanPipelines()
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

  async dispose() {
    this.watchers.forEach(item => item.dispose())
    super.dispose()
  }
}
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
function zipById<A extends { id: any }, B extends { id: any }>(lA: A[], lB: B[]): [A, B | undefined][] {
  return lA.map((a) => {
    const b = lB.find(b => b.id === a.id)
    return [a, b]
  })
}
