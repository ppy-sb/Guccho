import type { JSONContent } from '@tiptap/core'
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Scope,
  RankingSystem,
  ScoreRankingSystem,
  PPRankingSystem,
  Mode,
  Ruleset,
  AutopilotAvailable,
  RelaxAvailable,
  StandardAvailable,
  Relationship,
  MutualRelationship
} from './shared'

export type UserOfflineStatus = 'offline'
export type UserOnlineStatus = 'playing' | 'idle' | 'modding' | 'multiplaying'
export type UserWebsiteStatus = 'website-online'
export type UserActivityStatus =
  | UserOfflineStatus
  | UserOnlineStatus
  | UserWebsiteStatus

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

export interface BaseRank {
  rank?: number
  rankHistory?: Record<string, number>

  countryRank?: number
  // countryRankHistory: number[]

  accuracy?: number

  // TODO: Score
  // tops: Score[]
  // recent: Score[]
}

export interface PPRank extends BaseRank {
  performance: number
  performanceHistory?: Record<string, number>

  // TODO: BP
  // bests: Score[]
}
export interface ScoreRank extends BaseRank {
  score: bigint | null
  scoreHistory?: Record<string, bigint>
}

export type Rank<System extends RankingSystem> =
  System extends ScoreRankingSystem
  ? ScoreRank
  : System extends PPRankingSystem
  ? PPRank
  : BaseRank
export interface UserModeRulesetStatistics<
  AvailableRankingSystem extends RankingSystem = RankingSystem
> {
  // TODO: Achievement
  // achievements: Achievement[]
  ranking: {
    [P in RankingSystem as P extends AvailableRankingSystem
    ? P
    : never]: Rank<P>
  }
  playCount: number
  playTime: number
  totalHits: number
}

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
  scope: Record<Exclude<keyof UserOptional<unknown> | 'privateMessage', 'secrets'>, Scope>
}
export interface UserRelationship<Id> extends BaseUser<Id> {
  relationship: Relationship[],
  relationshipFromTarget: Relationship[],
  mutualRelationship: MutualRelationship[],
}

export type UserStatistic<
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends RankingSystem = RankingSystem
> = {
    [M in Mode as M extends IncludeMode ? M : never]: {
      [R in Ruleset as R extends IncludeRuleset
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
      : never]: UserModeRulesetStatistics<Ranking>
    }
  }
export interface UserExtra<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends RankingSystem = RankingSystem
> {
  statistics: UserStatistic<IncludeMode, IncludeRuleset, Ranking>

  profile?: JSONContent
  relationships: UserRelationship<Id>[]
  preferences: UserPreferences
}

export interface UserFull<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends RankingSystem = RankingSystem
> extends BaseUser<Id>, Partial<UserOptional<Id>>, Partial<UserExtra<Id, IncludeMode, IncludeRuleset, Ranking>> { }
