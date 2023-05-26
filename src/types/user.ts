import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  Ruleset,
  Scope,
} from './common'
import type { UserModeRulesetStatistics } from './statistics'
import type { UserRelationship } from './user-relationship'
import { ArticleProvider } from '$base/server'

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
export interface UserEssential<Id> {
  id: Id
  ingameId: number
  name: string
  safeName: string
  flag: string
  avatarSrc?: string

  roles: UserPrivilegeString[]
}

export interface UserOptional {
  reachable: boolean
  oldNames: UserHistoricalName[]
  email: string
  secrets: UserSecrets
  status: UserActivityStatus
}

export interface UserSettings {
  accessControl: Record<
    Exclude<keyof UserOptional, 'secrets'> | 'privateMessage',
    Partial<Record<Exclude<Scope, 'self'>, boolean>>
  >
}

export type UserStatistic<
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> = {
  [M in IncludeMode]: Record<
    AvailableRuleset<M, IncludeRuleset>,
    UserModeRulesetStatistics<Ranking>
  >
}

export interface UserExtra<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> {
  statistics: UserStatistic<IncludeMode, IncludeRuleset, Ranking>

  profile?: {
    html: string
    raw?: ArticleProvider.JSONContent
  }
  relationships: Array<UserRelationship<Id>>
  settings: UserSettings
}

export type UserFull<
  Id,
  IncludeMode extends Mode = Mode,
  IncludeRuleset extends Ruleset = Ruleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> = UserEssential<Id> &
Partial<UserOptional> &
Partial<UserExtra<Id, IncludeMode, IncludeRuleset, Ranking>>
