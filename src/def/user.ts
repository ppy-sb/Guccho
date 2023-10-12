import type { ZodType } from 'zod'
import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
} from './common'
import type { UserModeRulesetStatistics } from './statistics'
import type { UserRelationship } from './user-relationship'
import type { CountryCode } from './country-code'
import type { Lang } from '.'
import type { ArticleProvider } from '$base/server'

export enum Scope {
  Self,
  Friends,
  Public,
}

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

export enum UserRole {
  // restricted type
  Disabled = 'disabled',
  Restricted = 'restricted',

  // // registered without login
  // Registered = 'registered',
  Inactive = 'inactive',
  Normal = 'normal',
  Supported = 'supported',
  Supporter = 'supporter',

  // bancho.py privileges
  Verified = 'whitelisted',

  // bancho privileges
  Alumni = 'alumni',

  // users that have privileges
  TournamentStaff = 'tournamentStaff',
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

export enum DynamicSettingStore {
  Local,
  Server,
}

export interface UserSecrets {
  password: string
}

export interface UserClan<Id> {
  id: Id
  name: string
}
export interface UserCompact<Id> {
  id: Id
  ingameId: number
  name: string
  safeName: string
  flag?: CountryCode
  avatarSrc?: string

  roles: UserRole[]
}

export interface UserOptional {
  // oldNames?: UserOldName[]
  email: string
  status: UserStatus
}

export interface Action<T> {
  label: string
  execute(value: T): any
}

export type DynamicUserSetting<T, TLoc extends DynamicSettingStore, TLang> = {
  store: TLoc
  validator: ZodType<T>
  label: string
  actions?: Action<T>[]
  disabled?: boolean
  locale?: Partial<Record<Lang, TLang>>
} & ({
  type: 'input'
} | {
  type: 'select'
  options: { value: T; label: string; disabled?: boolean }[]
})

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
  relationships: Array<UserCompact<Id> & UserRelationship>
}

export type UserFull<
  Id,
  IncludeMode extends ActiveMode = ActiveMode,
  IncludeRuleset extends ActiveRuleset = ActiveRuleset,
  Ranking extends LeaderboardRankingSystem = LeaderboardRankingSystem,
> = UserCompact<Id> & Partial<UserOptional & UserExtra<Id, IncludeMode, IncludeRuleset, Ranking>>
