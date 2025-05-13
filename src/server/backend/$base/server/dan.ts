import { Mixin } from 'ts-mixer'
import { IdTransformable, ScoreIdTransformable } from './@extends'
import { type Dan, type DatabaseDan, type DatabaseDanCourse, type Requirement } from '~/def/dan'
import { type PaginatedResult } from '~/def/pagination'
import { type UserCompact } from '~/def/user'
import type { Mode, Ruleset } from '~/def'
import { type ScoreCompact } from '~/def/score'
import { type BaseBeatmapset, type BeatmapCompact } from '~/def/beatmap'

export namespace DanProvider {
  export interface QualifiedScore<Id, ScoreId> {
    player: {
      id: Id
      name: string
    }
    score: {
      id: ScoreId
      accuracy: number
      score: number
    }
    beatmap: {
      id: Id
      md5: string
      artist: string
      title: string
      version: string
    }
  }

  export interface RequirementQualifiedScore<Id, ScoreId> {
    // requirement: Requirement
    count: number
    scores: QualifiedScore<Id, ScoreId>[]
  }

  export interface UserDanClearedScore<Id, ScoreId> {
    score: Pick<ScoreCompact<ScoreId, Mode>, 'id' | 'score' | 'accuracy' | 'maxCombo' | 'grade' | 'mods' | 'playedAt'> & {
      mode: Mode
      ruleset: Ruleset
      beatmap: Pick<BeatmapCompact<Id, Id>, 'id' | 'creator' | 'mode' | 'version' | 'md5'> & {
        beatmapset: BaseBeatmapset<Id>
      }
    }
    dan: Pick<DatabaseDan<Id>, 'id' | 'name'>
    requirements: Requirement[]
  }

  export interface SearchParam {
    page: number
    perPage: number
    keyword: string
    rulesetDefaultsToStandard?: boolean
    mode?: Mode
    ruleset?: Ruleset
    mania?: { keyCount?: number }

  }

  export interface SearchDanParam<Id> extends SearchParam {
    excludeDanCourse?: Id
    excludeDans?: Id[]
    danglingOnly?: boolean
  }
  export interface SearchDanCourseParam extends SearchParam {
    allowEmpty?: boolean
  }

  export interface CreateDanCourseParam {
    name: string
    description: string
  }
  export interface UpdateDanCourseParam<Id> extends CreateDanCourseParam {
    id: Id
    dans?: Array<{ id: Id; shortName: string }>
  }

  export interface DeleteDanCourseParam<Id> {
    id: Id
    deleteDans: boolean
  }

  export interface ModeRulesetSelector {
    mode?: Mode
    ruleset?: Ruleset
    mania?: { keyCount?: number }
  }

  export interface RecalcQualifiedScoresParam<Id, ScoreId> {
    dan: {
      id: Id
      requirement?: Requirement
    }
    score?: {
      id?: ScoreId
    }
  }

  export type PickType = 'id' | 'pp' | 'score' | 'accuracy'
  export interface GetQualifiedScoresParam<Id> {
    id: Id
    requirement: Requirement
    pick?: PickType
    orderBy?: [PickType, 'asc' | 'desc']
    page: number
    perPage: number
  }

}

export abstract class DanProvider<Id, ScoreId> extends Mixin(IdTransformable, ScoreIdTransformable) {
  abstract search(opt: DanProvider.SearchDanParam<Id>): Promise<PaginatedResult<DatabaseDan<Id>>>
  abstract get(id: Id): Promise<DatabaseDan<Id>>
  abstract delete(id: Id): Promise<void>
  abstract getQualifiedScores(opt: DanProvider.GetQualifiedScoresParam<Id>): Promise<DanProvider.RequirementQualifiedScore<Id, ScoreId>>
  abstract recalcQualifiedScores(opt: DanProvider.RecalcQualifiedScoresParam<Id, ScoreId>): Promise<void>
  abstract runCustomDan(opt: Dan): Promise<Array<DanProvider.RequirementQualifiedScore<Id, ScoreId>>>
  abstract saveComposed(i: Dan | DatabaseDan<Id>, user: Pick<UserCompact<Id>, 'id'>): Promise<DatabaseDan<Id>>
  abstract countUserClearedDans(opt: { user: Pick<UserCompact<Id>, 'id'> } & DanProvider.ModeRulesetSelector): Promise<number>
  abstract getUserClearedDans(opt: { user: Pick<UserCompact<Id>, 'id'>; page: number; perPage: number } & DanProvider.ModeRulesetSelector): Promise<Array<DanProvider.UserDanClearedScore<Id, ScoreId>>>
  abstract exportAll(): Promise<DatabaseDan<Id>[]>

  // courses
  abstract searchCourses(opt: DanProvider.SearchDanCourseParam): Promise<PaginatedResult<DatabaseDanCourse<Id>>>
  abstract getCourse(id: Id): Promise<DatabaseDanCourse<Id>>
  abstract deleteCourse(opt: DanProvider.DeleteDanCourseParam<Id>): Promise<void>
  abstract createCourse(input: DanProvider.CreateDanCourseParam, user: Pick<UserCompact<Id>, 'id'>): Promise<Id>
  abstract updateCourse(input: DanProvider.UpdateDanCourseParam<Id>, user: Pick<UserCompact<Id>, 'id'>): Promise<DatabaseDanCourse<Id>>
}
