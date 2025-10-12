import assert from 'node:assert'
import { and, gt, inArray, lte, not, sql } from 'drizzle-orm'
import { type DanProvider } from '..'
import { MapProvider, ScoreProvider } from '../..'
import { type Id, type ScoreId } from '../../../'
import { BanchoPyScoreStatus } from '../../../../bancho.py/enums'
import { fromBanchoPyMode, toScore } from '../../../../bancho.py/transforms'
import * as schema from '../../../drizzle/schema'
import { UserProvider } from '../../user'
import { CacheSyncedDanProcessor, wait } from './$sync'
import { type Requirement } from '~/def/dan'
import { transformUsecase as compileDan } from '~/common/utils/dan'
import { type AbnormalStatus, type NormalBeatmapWithMeta, RankingStatus } from '~/def/beatmap'

// TODO implement
export class IntervalDanProcessor extends CacheSyncedDanProcessor implements CacheSyncedDanProcessor {
  interval?: NodeJS.Timeout
  lastProcessed = 0n
  constructor(dp: DanProvider) {
    super(dp)
  }

  get config() {
    assert(this.dp.config.dan, 'impossible state: IntervalDanProcessor created without config.')
    assert(this.dp.config.dan.processor === 'interval', 'impossible state: IntervalDanProcessor created when processor is not interval.')
    return this.dp.config.dan
  }

  override async init() {
    await super.init()

    const lastProcessed = await this.dp.drizzle.query.requirementClearedScores.findFirst({
      orderBy(tbl, op) {
        return op.desc(tbl.scoreId)
      },
      columns: {
        scoreId: true,
      },
    })
    this.lastProcessed = lastProcessed?.scoreId ?? 0n

    let wrappedJob
    {
      let finished = true
      wrappedJob = async () => {
        if (finished) {
          finished = false
          try {
            await this.job()
          }
          catch (e) {
            this.logger.error(e)
          }
          finally {
            finished = true
          }
        }
        else {
          this.logger.debug('interval job already in progress, skipping')
        }
      }
    }

    await wrappedJob()
    this.interval = setInterval(wrappedJob, this.config.interval)
  }

  async job() {
    await this.dp.drizzle.transaction(async (tx) => {
      // skip if no new scores
      const latest = await this.getLatestScoreId(tx)
      if (undefined === latest) {
        return
      }
      else if (latest < this.lastProcessed) {
        this.logger.debug('new scores are older than last processed, skipping.')
        this.lastProcessed = latest
        return
      }
      else if (latest === this.lastProcessed) {
        this.logger.debug('no new scores, skipping.')
        return
      }

      this.logger.debug(`processing requirement cleared scores where score id between ${this.lastProcessed} and ${latest}.`)

      await wait(2000) // PRAY for patcher meta saved, since bpy submitModular is NOT USING A TRANSACTION !!!
      await this.processScores(this.lastProcessed, latest, tx)
      await this.updateLastProcessed(tx)
    })
  }

  async processScores(gtScoreId: ScoreId, lteScoreId?: ScoreId, tx?: CacheSyncedDanProcessor.TX) {
    tx = tx || await this.getTx(this.dp.drizzle)
    const scores = await tx.query.scores.findMany({
      where: and(
        gt(schema.scores.id, gtScoreId),
        lteScoreId ? lte(schema.scores.id, lteScoreId) : undefined,
        gt(schema.scores.status, BanchoPyScoreStatus.DNF),
        not(
          inArray(
            schema.scores.id,
            this.dp.drizzle
              .select({ scoreId: schema.requirementClearedScores.scoreId })
              .from(schema.requirementClearedScores)
          )
        )
      ),
      with: {
        user: true,
        beatmap: {
          with: {
            source: true,
          },
        },
        patcherMeta: true,
      },
      orderBy(fields, operators) {
        return operators.asc(fields.id)
      },
      limit: 1000,
    })

    if (!scores.length) {
      return
    }

    const inserting: {
      scoreId: bigint
      dan: number
      requirement: Requirement
    }[] = []

    for (const [_, dan] of this.dans) {
      const pipeline = this.pipelines.get(dan) || this.pipelines.set(dan, compileDan(dan)).get(dan)!

      for (const {
        patcherMeta: meta,
        beatmap: bm,
        user,
        ...score
      } of scores) {
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

  async updateLastProcessed(tx: Omit<typeof this.dp.drizzle, '$client'>) {
    const id = await this.getLatestScoreId(tx)
    if (id) {
      this.lastProcessed = id
    }
  }

  async getLatestScoreId(tx: Omit<typeof this.dp.drizzle, '$client'>) {
    const res = await tx.query.scores.findFirst({
      orderBy(fields, operators) {
        return operators.desc(fields.id)
      },
      columns: {
        id: true,
      },
    })
    return res?.id
  }
}
