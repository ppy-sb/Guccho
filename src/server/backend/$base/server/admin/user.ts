import { type Mode } from 'node:fs'
import type { Composition } from '../@common'
import { IdTransformable } from '../@extends'
import { type Ruleset } from '~/def'
import { type ModeRulesetScoreStatistic } from '~/def/statistics'
import type { UserClan, UserCompact, UserOptional, UserSecrets } from '~/def/user'
import { type ComputedUserRole } from '~/utils/common'

export namespace AdminUserProvider {
  export interface MetricsParam {
    active: 'daily' | 'weekly' | 'monthly'
  }
  export interface Metrics {
    count: {
      total: number
      active: number
      restricted: number
      new: number
    }
  }
}

export abstract class AdminUserProvider<Id> extends IdTransformable {
  abstract userList(
    query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> &
    Partial<UserSecrets> &
    Composition.Pagination
  ): Promise<
    readonly [
      number,
      Array<
        UserCompact<Id> &
        Pick<UserOptional, 'email' | 'status'> & {
          registeredAt: Date
          lastActivityAt: Date
          clan?: UserClan<Id>
        }
      >,
    ]
  >
  abstract userDetail(query: {
    id: Id
  }): Promise<UserCompact<Id> & UserOptional>
  abstract updateUserDetail(
    updater: { role: ComputedUserRole },
    query: { id: Id },
    updateFields: Partial<UserCompact<Id> & UserOptional>
  ): Promise<UserCompact<Id> & UserOptional>
  abstract getUserModeRulesetStatistics(query: { id: Id; mode: Mode; ruleset: Ruleset }): Promise<ModeRulesetScoreStatistic>
  abstract recalcUserModeRulesetStatistics(query: { id: Id; mode: Mode; ruleset: Ruleset }): Promise<ModeRulesetScoreStatistic>
  abstract clearUserModeRulesetStatistics(query: { id: Id; mode: Mode; ruleset: Ruleset }): Promise<ModeRulesetScoreStatistic>
  abstract recalcUserAllStatistics(query: { id: Id }): Promise<void>
  abstract clearUserAllStatistics(query: { id: Id }): Promise<void>
  abstract metrics(input: AdminUserProvider.MetricsParam): Promise<AdminUserProvider.Metrics>
}
