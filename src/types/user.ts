import type { JSONContent } from '@tiptap/core'
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  AutopilotAvailable,
  Mode,
  MutualRelationship,
  RankingSystem,
  Relationship,
  RelaxAvailable,
  Ruleset,
  Scope,
  StandardAvailable,
} from './common'
import type { UserModeRulesetStatistics } from './statistics'

export interface UserStatus {
  Offline: 'offline'
  Online: 'playing' | 'idle' | 'modding' | 'multiplaying'
  Website: 'website-online'
}
export type UserActivityStatus = UserStatus[keyof UserStatus]

export type UserPrivilegeString =
  // restricted type
  | 'disabled'
  | 'restricted'

  // registered without login
  | 'registered'

  // normal users
  | 'inactive'
  | 'normal'
  | 'supported'
  | 'supporter'

  // bancho.py privileges
  | 'bypassAntiCheat'

  // bancho privileges
  | 'alumni'

  // users that has privileges
  | 'tournamentStuff'
  | 'channelModerator'
  | 'moderator'
  | 'beatmapNominator'
  | 'staff'
  | 'admin'

  // dangerous
  | 'owner'

  // misc
  | 'bot'

export interface UserHistoricalName {
  from: Date
  to: Date
  name: string
}

export interface UserSecrets {
  password: string
  apiKey?: string
}
export interface BaseUser<Id> {
  id: Id
  ingameId: number
  name: string
  safeName: string
  flag: string
  avatarUrl: string

  roles: UserPrivilegeString[]
}

export interface UserOptional<Id = unknown> {
  reachable: boolean
  oldNames: UserHistoricalName[]
  email: string
  secrets: UserSecrets
  status: UserActivityStatus
}

export interface UserPreferences {
  scope: Record<
    Exclude<keyof UserOptional | 'privateMessage', 'secrets'>,
    Scope
  >
}
export interface UserRelationship<Id> extends BaseUser<Id> {
  relationship: Relationship[]
  relationshipFromTarget: Relationship[]
  mutualRelationship: MutualRelationship[]
}

type AvailableRuleset<R extends Mode> =
| (R extends StandardAvailable ? 'standard' : never)
| (R extends RelaxAvailable ? 'relax' : never)
| (R extends AutopilotAvailable ? 'autopilot' : never)

export type UserStatistic<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends RankingSystem = RankingSystem,
> = {
  [M in IncludeMode]: Record<
    IncludeRuleset & AvailableRuleset<M>,
    UserModeRulesetStatistics<Id, M, AvailableRuleset<M>, Ranking>
  >;
}

export interface UserExtra<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends RankingSystem = RankingSystem,
> {
  statistics: UserStatistic<Id, IncludeMode, IncludeRuleset, Ranking>

  profile: string
  profileJSON?: JSONContent
  relationships: Array<UserRelationship<Id>>
  preferences: UserPreferences
}

export type UserFull<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends RankingSystem = RankingSystem,
> = BaseUser<Id> & Partial<UserOptional<Id>>
& Partial<UserExtra<Id, IncludeMode, IncludeRuleset, Ranking>>
