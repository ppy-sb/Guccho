import type { ExtractLocationSettings, ExtractSettingType } from '../@define-setting'
import type { Composition } from './@common'
import { IdTransformable } from './@extends'
import type { MailTokenProvider } from './mail-token'
import { type ArticleProvider } from '.'
import type { settings } from '$active/dynamic-settings'
import type { Mode, Ruleset } from '~/def'
import type { BeatmapSource, RankingStatus } from '~/def/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
} from '$active'
import type { CountryCode } from '~/def/country-code'
import type { RankingSystemScore } from '~/def/score'
import {
  type DynamicSettingStore,
  type Scope,
  type UserClan,
  type UserCompact,
  type UserCompact as UserCompact$2,
  type UserExtra,
  type UserOptional,
  UserRole,
  type UserStatus,
} from '~/def/user'
import { type UserModeRulesetStatistics } from '~/def/statistics'

export namespace UserProvider {
  export type ComposableProperties<Id> = UserExtra<Id> & UserOptional & { clan: UserClan<Id> | null }
  export interface OptType {
    handle: string
    keys?: Array<'id' | 'name' | 'safeName' | 'email'>
  }

  export interface BaseQuery<
    Id,
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
    > extends Composition.Pagination {
    id: Id
    mode: Mode
    ruleset: Ruleset
    rankingSystem: RankingSystem
    rankingStatus?: RankingStatus[]
  }

  export type UserCompact<Id> = UserCompact$2<Id>
}

export abstract class UserProvider<Id, ScoreId> extends IdTransformable {
  abstract uniqueIdent(input: string): Promise<boolean>

  abstract getCompact(
    opt: UserProvider.OptType & { scope: Scope }
  ): Promise<UserCompact<Id>>

  abstract testPassword(
    opt: UserProvider.OptType,
    password: string,
  ): Promise<[boolean, UserCompact<Id>]>

  abstract getCompactById(id: Id): Promise<UserCompact<Id>>

  abstract getByEmail(email: MailTokenProvider.Email, opt?: { scope: Scope }): Promise<UserCompact<Id>>

  abstract getStatistic(query: {
    id: Id
    mode: Mode
    ruleset: Ruleset
  },
    visitor?: { id: Id }
  ): Promise<UserModeRulesetStatistics<LeaderboardRankingSystem>>

  abstract getFull<
    Excludes extends Partial<
      Record<keyof UserProvider.ComposableProperties<Id>, boolean>
    >,
    _Scope extends Scope = Scope.Public,
  >(query: {
    handle: string
    excludes?: Excludes
    includeHidden?: boolean
    scope: _Scope
  }): Promise<
    UserCompact<Id> & {
      [K in keyof UserProvider.ComposableProperties<Id> as Excludes[K] extends true
        ? never
        : K
      ]: UserProvider.ComposableProperties<Id>[K];
    }
  >
  abstract getSettings(id: Id): Promise<{
    changeable: {
      email: boolean
      name: boolean
      flag: boolean
    }
    email: string
    profile: {
      html: string
      raw?: ArticleProvider.JSONContent
    }
    preferredMode: {
      mode: Mode
      ruleset: Ruleset
    }
  } & UserCompact<Id>>

  abstract changeEmail(user: { id: Id }, newEmail: MailTokenProvider.Email): Promise<Pick<UserOptional, 'email'>>

  abstract changeSettings(
    user: { id: Id },
    input: {
      // email?: string
      name?: string
      flag?: CountryCode
      preferredMode?: {
        mode: Mode
        ruleset: Ruleset
      }
    }
  ): Promise<UserCompact<Id>>

  abstract changeUserpage(
    user: { id: Id },
    input: {
      profile: ArticleProvider.JSONContent
    }
  ): Promise<{
    html: string
    raw: ArticleProvider.JSONContent
  }>

  abstract changeVisibility(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      userpageContent?: string
    }
  ): Promise<UserCompact<Id>>

  abstract changePasswordNoCheck(user: { id: Id }, newPassword: string): Promise<void>

  abstract changePassword(
    user: { id: Id },
    oldPassword: string,
    newPassword: string
  ): Promise<UserCompact<Id>>

  abstract changeAvatar(user: { id: Id }, avatar: Uint8Array): Promise<string>

  abstract search(opt: {
    keyword: string
    limit: number
  }): Promise<Array<UserCompact<Id> & { clan: UserClan<Id> | null }>>

  abstract count(opt: {
    keyword?: string
  }): Promise<number>

  abstract status({ id }: { id: Id }): Promise<{
    status: UserStatus.Offline
    lastSeen: Date
  } | {
    status: Exclude<UserStatus, UserStatus.Offline>
    description: string
    mode: ActiveMode
    ruleset: ActiveRuleset
    beatmap?: {
      id: number
      foreignId: number
      md5: string
      version: string
      creator: string
      beatmapset: {
        id: number
        foreignId: number
        meta: {
          intl: {
            artist: string
            title: string
          }
        }
        source: BeatmapSource
      }
    }
  } | null>

  abstract register(opt: {
    name: string
    safeName?: string
    email: string
    password: string
  }): Promise<UserCompact<Id>>

  abstract getDynamicSettings(user: { id: Id }): Promise<ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>>

  abstract setDynamicSettings(user: { id: Id }, args: ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>): Promise<ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>>

  abstract getBests<
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, Mode, Ruleset, RankingSystem>): Promise<RankingSystemScore<ScoreId, Id, Mode, RankingSystem>[]>

  abstract getTops<
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, Mode, Ruleset, RankingSystem>): Promise<{
    count: number
    scores: RankingSystemScore<ScoreId, Id, Mode, RankingSystem>[]
  }>
}
