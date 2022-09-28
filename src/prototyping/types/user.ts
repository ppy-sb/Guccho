/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  VisibilityScope,
  RankingSystem,
  ScoreRankingSystem,
  Mode,
  Ruleset,
  AutopilotAvailable,
  RelaxAvailable,
  StandardAvailable,
  OmitNever,
  Awaitable,
  APIfy
} from './shared'
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
  rankGraph: number[]

  countryRank: number,
  // countryRankGraph: number[]

  // TODO: Score
  // tops: Score[]
  // recent: Score[]
}

export interface PPRank extends BaseRank {
  performance: number
  performanceGraph: number[]

  // TODO: BP
  // bests: Score[]
}
export interface ScoreRank extends BaseRank {
  score: number
  scoreGraph: number[]
}

export type Rank<System extends RankingSystem> =
  System extends ScoreRankingSystem ? ScoreRank : PPRank
export interface UserModeRulesetStatistics<AvailableRankingSystem extends RankingSystem = RankingSystem> {
  // achievements: Achievement[]
  ranking: OmitNever<{
    [P in RankingSystem]: P extends AvailableRankingSystem ? Rank<P> : never
  }>
}

export interface UserHistoricalName {
  from: Date
  to: Date
  name: string
  visibility: VisibilityScope
}

export interface UserPreferences {
  allowPrivateMessage: boolean
  visibility: {
    email: VisibilityScope
    oldNamesDefault: VisibilityScope
  }
}
export interface BaseUser<Id> {
  id: Id
  ingameId: number
  name: string
  safeName: string

  email: string
  oldNames: UserHistoricalName[]

  flag: string,
}

export interface UserSecrets {
  password: string,
  apiKey?: string
}

export type UserFriend<Id> = BaseUser<Id>

export interface UserModel<Id, IncludeSecrets extends boolean, IncludeMode extends Mode, IncludeRuleset extends Ruleset, Ranking extends RankingSystem> extends BaseUser<Id> {
  statistics: OmitNever<{
    [M in Mode]: M extends IncludeMode ? OmitNever<{
      [R in Ruleset]:
        R extends IncludeRuleset

        ? M extends StandardAvailable
        ? R extends 'standard'
        ? UserModeRulesetStatistics<Ranking>

        : M extends RelaxAvailable
        ? R extends 'relax'
        ? UserModeRulesetStatistics<Ranking>

        : M extends AutopilotAvailable
        ? R extends 'autopilot'
        ? UserModeRulesetStatistics<Ranking>

        : never
        : never
        : never
        : never

      : never
    }>
    : never
  }>

  reachable: boolean
  status: UserActivityStatus

  friends: UserFriend<Id>[]

  preferences: UserPreferences

  secrets: IncludeSecrets extends true ? UserSecrets : never
}

export type User<
  Id,
  Secret extends boolean = false,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranks extends RankingSystem = RankingSystem
> = OmitNever<UserModel<Id, Secret, IncludeMode, IncludeRuleset, Ranks>>

export type UserAPI<Id> = APIfy<User<Id, true>,
  | 'preferences'
  | 'reachable'
  | 'statistics'
  | 'oldNames'
  | 'secrets'
>
