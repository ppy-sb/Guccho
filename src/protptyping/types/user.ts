/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Identifier } from './shared'
// server types
// export type UserOfflineStatus = 'offline'
export enum UserOfflineStatus {
  OFFLINE = 'offline'
}
export type UserOnlineStatus = 'playing' | 'idle' | 'modding' | 'multiplaying'
export type UserWebsiteStatus = 'website-online'
export type UserActivityStatus = UserOfflineStatus | UserOnlineStatus | UserWebsiteStatus

export enum UserPrivilege {
  banned = 1 << 0,
  default = 1 << 1,
  channelModerator = 1 << 2,
  moderator = 1 << 3,
  beatmapNominator = 1 << 4,
  staff = 1 << 5,
  admin = 1 << 6,
  superuser = 1 << 7
}

export type UserPrivilegeString = keyof typeof UserPrivilege

export interface UserStatus {
  activity: UserActivityStatus,
  privilege: UserPrivilege,
  roles: UserPrivilegeString[]
}

// game types
export type Mode = 'osu' | 'taiko' | 'fruits' | 'mania'
export type Ruleset = 'standard' | 'relax' | 'autopilot'

type ScoreRankingSystem = 'rankedScores' | 'totalScores'
type PPRankingSystem = 'ppv2' | 'ppv1'
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type Rank<T extends RankingSystem> = {
  rank: number,
  performance: T extends PPRankingSystem ? number : never
  score: T extends ScoreRankingSystem ? number : never
}
export interface UserModeRulesetStatistics {

  // achievements: Achievement[]
  ranking: Record<RankingSystem, Rank<RankingSystem>>
}

export interface UserHistoricalName {
  from: Date,
  to: Date,
  name: string
}

export interface UserContact {
  email: string,
  oldNames: UserHistoricalName[]
}
export interface UserPreferences {
  allowPrivateMessage: boolean
}
export interface BaseUser<ID extends Identifier = Identifier> {
  id: ID,
  name: string,
  safeName: string
}

export interface UserSecrets {
  password: string,
}

export type UserFriend<ID extends Identifier = Identifier> = BaseUser<ID>

export interface User<
  ID extends Identifier = Identifier,
  Secret extends boolean = false
> extends BaseUser<ID>, UserContact {
  statistics: Record<Mode, Record<Ruleset, UserModeRulesetStatistics>>

  reachable: boolean
  status: UserActivityStatus

  friends: UserFriend[]

  preferences: UserPreferences

  secrets: Secret extends true ? UserSecrets : never
}
