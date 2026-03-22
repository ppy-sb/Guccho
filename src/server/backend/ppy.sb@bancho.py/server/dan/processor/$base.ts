import { type DanProvider } from '..'
import { type DanProvider as Base } from '$base/server/dan'
import { type Cond, type DatabaseDan, type DatabaseRequirementCondBinding, type Requirement } from '~/def/dan'
import { Logger } from '~/server/backend/ppy.sb@bancho.py/log'

export namespace BaseDanProcessor {
  export interface RecalcProvidedDanParam<Id, ScoreId> extends Omit<Base.RecalcQualifiedScoresParam<Id, ScoreId>, 'dan'> {
    dan: DatabaseDan<Id, DatabaseRequirementCondBinding<Id, Requirement, Cond>>
  }
}
export abstract class BaseDanProcessor<Id, ScoreId> {
  logger = Logger.child({ label: 'dan:processor' })
  constructor(readonly dp: DanProvider) {}
  abstract recalcDan(opt: Base.RecalcQualifiedScoresParam<Id, ScoreId>): Promise<void>
  abstract recalcProvidedDan(opt: BaseDanProcessor.RecalcProvidedDanParam<Id, ScoreId>): Promise<void>
  abstract init(): Promise<void>
  abstract dispose(): Promise<void>
}
