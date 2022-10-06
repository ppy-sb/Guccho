/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JSONContent } from '@tiptap/core'
import type {
  VisibilityScope,
  RankingSystem,
  ScoreRankingSystem,
  PPRankingSystem,
  Mode,
  Ruleset,
  AutopilotAvailable,
  RelaxAvailable,
  StandardAvailable,
  OmitNever,
  Awaitable,
  APIfy
} from './shared'

export type UserOfflineStatus = 'offline'
export type UserOnlineStatus = 'playing' | 'idle' | 'modding' | 'multiplaying'
export type UserWebsiteStatus = 'website-online'
export type UserActivityStatus =
  | UserOfflineStatus
  | UserOnlineStatus
  | UserWebsiteStatus

// export enum UserPrivilege {
//   banned = 1 << 0,
//   default = 1 << 1,
//   channelModerator = 1 << 2,
//   moderator = 1 << 3,
//   beatmapNominator = 1 << 4,
//   staff = 1 << 5,
//   admin = 1 << 6,
//   superuser = 1 << 7,
// }

export type UserPrivilegeString = 'inactivated' | 'restricted' | 'normal' | 'channelModerator' | 'moderator' | 'beatmapNominator' | 'staff' | 'admin' | 'owner'

export interface UserStatus {
  activity: UserActivityStatus
  roles: UserPrivilegeString[]
}

export interface BaseRank {
  rank: number
  rankHistory: Record<string, number>

  countryRank: number,
  // countryRankHistory: number[]

  accuracy: number
  // TODO: Score
  // tops: Score[]
  // recent: Score[]
}

export interface PPRank extends BaseRank {
  performance: number
  performanceHistory: Record<string, number>

  // TODO: BP
  // bests: Score[]
}
export interface ScoreRank extends BaseRank {
  score: number
  scoreHistory: Record<string, number>
}

export type Rank<System extends RankingSystem> =
  System extends ScoreRankingSystem
  ? ScoreRank
  : System extends PPRankingSystem
  ? PPRank
  : BaseRank
export interface UserModeRulesetStatistics<AvailableRankingSystem extends RankingSystem = RankingSystem> {
  // TODO: Achievement
  // achievements: Achievement[]
  ranking: {
    [P in RankingSystem as P extends AvailableRankingSystem ? P : never]: Rank<P>
  },
  playCount: number
  playTime: number
  totalHits: number
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
    oldNames: VisibilityScope
  }
}
export interface BaseUser<Id> {
  id: Id
  ingameId: number
  name: string
  safeName: string

  email: string

  flag: string,
}

export interface UserSecrets {
  password: string,
  apiKey?: string
}

export type UserFriend<Id> = BaseUser<Id>

export interface UserModel<Id, IncludeSecrets extends boolean, IncludeMode extends Mode, IncludeRuleset extends Ruleset, Ranking extends RankingSystem> extends BaseUser<Id> {
  statistics: {
    [M in Mode as M extends IncludeMode ? M : never]: {
      [R in Ruleset as
        R extends IncludeRuleset

        ? M extends StandardAvailable
        ? R extends 'standard'
        ? R

        : M extends RelaxAvailable
        ? R extends 'relax'
        ? R

        : M extends AutopilotAvailable
        ? R extends 'autopilot'
        ? R

        : never
        : never
        : never
        : never
        : never
      ]: UserModeRulesetStatistics<Ranking>
    }
  }

  reachable: boolean
  status: UserActivityStatus

  oldNames: UserHistoricalName[]
  profile: JSONContent,

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

export type UserAPI<Id, Secrets extends boolean = false> =
  Secrets extends true ?
  APIfy<User<Id, true>,
    | 'preferences'
    | 'reachable'
    | 'statistics'
    | 'oldNames'
    | 'secrets'
  >
  : APIfy<User<Id, false>,
    | 'preferences'
    | 'reachable'
    | 'statistics'
    | 'oldNames'
  >
