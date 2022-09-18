/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Identifier, RankingSystem, ScoreRankingSystem, Mode, Ruleset, AutopilotAvailable, RelaxAvailable, StandardAvailable, OmitNever } from './shared'
// server types
// export type UserOfflineStatus = 'offline'
export enum UserOfflineStatus {
  OFFLINE = 'offline',
}
export type UserOnlineStatus = 'playing' | 'idle' | 'modding' | 'multiplaying'
export type UserWebsiteStatus = 'website-online'
export type UserActivityStatus =
  | UserOfflineStatus
  | UserOnlineStatus
  | UserWebsiteStatus

export enum UserPrivilege {
  banned = 1 << 0,
  default = 1 << 1,
  channelModerator = 1 << 2,
  moderator = 1 << 3,
  beatmapNominator = 1 << 4,
  staff = 1 << 5,
  admin = 1 << 6,
  superuser = 1 << 7,
}

export type UserPrivilegeString = keyof typeof UserPrivilege

export interface UserStatus {
  activity: UserActivityStatus
  privilege: UserPrivilege
  roles: UserPrivilegeString[]
}

export interface BaseRank {
  rank: number

  // TODO: Score
  // bests: Score[]
  // tops: Score[]
  // recent: Score[]
}

export interface PPRank extends BaseRank {
  performance: number
}
export interface ScoreRank extends BaseRank {
  score: number
}

export type Rank<System extends RankingSystem> =
  System extends ScoreRankingSystem ? ScoreRank : PPRank
export interface UserModeRulesetStatistics {
  // achievements: Achievement[]
  ranking: {
    [P in RankingSystem]: Rank<P>
  }
}

export interface UserHistoricalName {
  from: Date
  to: Date
  name: string
}

export interface UserContact {
  email: string
  oldNames: UserHistoricalName[]
}
export interface UserPreferences {
  allowPrivateMessage: boolean
}
export interface BaseUser<Id extends Identifier = Identifier> {
  id: Id
  ingameId: number
  name: string
  safeName: string
}

export interface UserSecrets {
  password: string
}

export type UserFriend<ID extends Identifier = Identifier> = BaseUser<ID>

export interface User<
  ID extends Identifier = Identifier,
  Secret extends boolean = false
> extends BaseUser<ID>,
  UserContact {
  statistics: {
    [M in Mode]: OmitNever<{
      [R in Ruleset]:
        M extends StandardAvailable ? R extends 'standard' ? UserModeRulesetStatistics :
        M extends RelaxAvailable ? R extends 'relax' ? UserModeRulesetStatistics :
        M extends AutopilotAvailable ? R extends 'autopilot' ? UserModeRulesetStatistics :
        never :
        never :
        never :
        never
    }>
  }

  reachable: boolean
  status: UserActivityStatus

  friends: UserFriend[]

  preferences: UserPreferences

  secrets: Secret extends true ? UserSecrets : never
}
