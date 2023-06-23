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
  Idle,
  Afk,
  Playing,
  Editing,
  Modding,
  MatchLobby,
  Watching,
  Unknown,
  Testing,
  Submitting,
  Paused,
  Lobby,
  MatchOngoing,
  OsuDirect,
}

export type StatusWithBeatmap = UserStatus.Playing | UserStatus.Editing | UserStatus.Editing | UserStatus.Modding | UserStatus.Modding | UserStatus.Watching | UserStatus.Testing | UserStatus.MatchOngoing | UserStatus.OsuDirect

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
  status: UserStatus
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
  relationships: Array<UserEssential<Id> & UserRelationship>
  settings: UserSettings
}

export type UserFull<
  Id,
  IncludeMode extends ActiveMode = ActiveMode,
  IncludeRuleset extends ActiveRuleset = ActiveRuleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> = UserEssential<Id> & Partial<UserOptional & UserExtra<Id, IncludeMode, IncludeRuleset, Ranking>>
