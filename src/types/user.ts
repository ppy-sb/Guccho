import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
} from './common'
import { Scope } from './defs'
import type { UserModeRulesetStatistics } from './statistics'
import type { UserRelationship } from './user-relationship'
import { ArticleProvider } from '$base/server'

export enum UserStatus {
  Offline = -1,
  Idle = 0,
  Afk = 1,
  Playing = 2,
  Editing = 3,
  Modding = 4,
  Multiplayer = 5,
  Watching = 6,
  Unknown = 7,
  Testing = 8,
  Submitting = 9,
  Paused = 10,
  Lobby = 11,
  Multiplaying = 12,
  OsuDirect = 13,
}

export type StatusWithBeatmap = UserStatus.Playing | UserStatus.Editing | UserStatus.Editing | UserStatus.Modding | UserStatus.Modding | UserStatus.Watching | UserStatus.Testing | UserStatus.Multiplaying | UserStatus.OsuDirect

export type UserActivityStatus = UserStatus

export enum UserPrivilege {
  // restricted type
  Disabled = 'disabled',
  Restricted = 'restricted',

  // registered without login
  Registered = 'registered',
  Inactive = 'inactive',
  Normal = 'normal',
  Supported = 'supported',
  Supporter = 'supporter',

  // bancho.py privileges
  Whitelisted = 'whitelisted',

  // bancho privileges
  Alumni = 'alumni',

  // users that have privileges
  TournamentStuff = 'tournamentStuff',
  ChannelModerator = 'channelModerator',
  Moderator = 'moderator',
  BeatmapNominator = 'beatmapNominator',
  Staff = 'staff',
  Admin = 'admin',

  // dangerous
  Owner = 'owner',

  // misc
  Bot = 'bot',
}

export interface UserOldName {
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

  roles: UserPrivilege[]
}

export interface UserOptional {
  reachable: boolean
  oldNames: UserOldName[]
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
  IncludeMode extends ActiveMode = ActiveMode,
  IncludeRuleset extends ActiveRuleset = ActiveRuleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> = {
  [M in IncludeMode]: Record<
    AvailableRuleset<M, IncludeRuleset>,
    UserModeRulesetStatistics<Ranking>
  >
}

export interface UserExtra<
  Id,
  IncludeMode extends ActiveMode = ActiveMode,
  IncludeRuleset extends ActiveRuleset = ActiveRuleset,
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
  IncludeMode extends ActiveMode = ActiveMode,
  IncludeRuleset extends ActiveRuleset = ActiveRuleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> = UserEssential<Id> &
Partial<UserOptional> &
Partial<UserExtra<Id, IncludeMode, IncludeRuleset, Ranking>>
