import type { ZodType } from 'zod'
import type { UserRelationship } from './user-relationship'
import type { CountryCode } from './country-code'
import type { Lang, Mode, Ruleset } from '.'
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
  Inactive = 'inactive',
  Supported = 'supported',
  Supporter = 'supporter',

  Verified = 'verified',

  // bancho privileges
  Alumni = 'alumni',

  // users that have privileges
  TournamentStaff = 'tournamentStaff',
  ChannelModerator = 'channelModerator',
  BeatmapNominator = 'beatmapNominator',
  Moderator = 'moderator',
  Staff = 'staff',
  Admin = 'admin',

  // dangerous
  Owner = 'owner',

  // misc
  Bot = 'bot',
}

export const userRoles = Object.values(UserRole).filter((value): value is UserRole => typeof value === 'number') as readonly UserRole[]

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
  badge: string
}
export interface UserCompact<Id> {
  id: Id
  stableClientId: number
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
  preferredMode: {
    mode: Mode
    ruleset: Ruleset
  }
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
  readonly?: boolean
  locale?: Partial<Record<Lang, TLang>>
} & ({
  type: 'input'
} | {
  type: 'select'
  options: { value: T; label: string; disabled?: boolean }[]
})

export interface UserExtra<
  Id,
> {
  profile?: {
    html: string
    raw?: ArticleProvider.JSONContent
  }
  relationships: Array<UserCompact<Id> & UserRelationship>
}

export type UserFull<Id> = UserCompact<Id> & Partial<UserOptional & UserExtra<Id>>
