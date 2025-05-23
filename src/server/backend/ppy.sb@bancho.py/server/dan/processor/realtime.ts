import MySQLEvents, { type DeleteEvent, type InsertEvent, type UpdateEvent } from '@rodrigogs/mysql-events'
import { type InferSelectModel, inArray } from 'drizzle-orm'
import { UserProvider } from '../../user'
import { MapProvider, ScoreProvider } from '../..'
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
      // watchTable(schema.scores, MySQLEvents.STATEMENTS.UPDATE, this.onScoreSubmitted.bind(this)),
    ]
  }

  async onScoreSubmitted(row: InsertEvent<InferSelectModel<typeof schema.scores>>) {
    const scores = row.affectedRows.map(item => item.after)

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
      // PRAY for patcher meta saved, since bpy submitModular is NOT USING A TRANSACTION !!!
      await wait(2000),
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
