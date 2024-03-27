import type { JSONContent } from '@tiptap/core'
import type { ExtractLocationSettings, ExtractSettingType } from '../@define-setting'
import { IdTransformable } from './@extends'
import type { Composition } from './@common'
import type { settings } from '$active/dynamic-settings'
import type { Mode, Ruleset } from '~/def'
import type { BeatmapSource, RankingStatus } from '~/def/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
} from '~/def/common'
import type { CountryCode } from '~/def/country-code'
import type { RankingSystemScore } from '~/def/score'
import type {
  DynamicSettingStore,
  Scope,
  UserClan,
  UserCompact,
  UserCompact as UserCompact$2,
  UserExtra,
  UserOptional,
  UserStatistic,
  UserStatus,
} from '~/def/user'

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
    rankingStatus: RankingStatus[]
  }

  export type UserCompact<Id> = UserCompact$2<Id>
}
export abstract class UserProvider<Id, ScoreId> extends IdTransformable {
  abstract uniqueIdent(input: string): PromiseLike<boolean>

  abstract getCompact(
    opt: UserProvider.OptType & { scope: Scope }
  ): Promise<UserCompact<Id>>

  abstract testPassword(
    opt: UserProvider.OptType & { scope: Scope },
    hashedPassword: string,
  ): Promise<[boolean, UserCompact<Id> | undefined]>

  abstract getCompactById(opt: {
    id: Id
    scope: Scope
  }): Promise<UserCompact<Id>>

  abstract getStatistics(query: {
    id: Id
    flag: CountryCode
  }): PromiseLike<UserStatistic>

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
  getFullWithSettings<
    Excludes extends Partial<
      Record<keyof UserProvider.ComposableProperties<Id>, boolean>
    >,
    _Scope extends Scope = Scope.Public,
  >(query: {
    handle: string
    excludes?: Excludes
    includeHidden?: boolean
    scope: _Scope
  }) {
    return this.getFull(query)
  }

  abstract changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      flag?: CountryCode
      preferredMode: {
        mode: Mode
        ruleset: Ruleset
      }
    }
  ): PromiseLike<UserCompact<Id>>

  abstract changeUserpage(
    user: { id: Id },
    input: {
      profile: JSONContent
    }
  ): PromiseLike<{
    html: string
    raw: JSONContent
  }>

  abstract changeVisibility(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      userpageContent?: string
    }
  ): PromiseLike<UserCompact<Id>>

  abstract changePassword(
    user: { id: Id },
    oldPasswordMD5: string,
    newPasswordMD5: string
  ): PromiseLike<UserCompact<Id>>

  abstract changeAvatar(user: { id: Id }, avatar: Uint8Array): PromiseLike<string>

  abstract search(opt: {
    keyword: string
    limit: number
  }): PromiseLike<Array<UserCompact<Id> & { clan: UserClan<Id> | null }>>

  abstract count(opt: {
    keyword?: string
  }): PromiseLike<number>

  abstract status({ id }: { id: Id }): PromiseLike<{
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
      beatmapset?: {
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

  abstract register(opt: { name: string; safeName: string; email: string; passwordMd5: string }): PromiseLike<UserCompact<Id>>

  abstract getDynamicSettings(user: { id: Id }): Promise<ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>>

  abstract setDynamicSettings(user: { id: Id }, args: ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>): Promise<ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>>

  abstract getBests<
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, Mode, Ruleset, RankingSystem>): PromiseLike<RankingSystemScore<ScoreId, Id, Mode, RankingSystem>[]>

  abstract getTops<
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, Mode, Ruleset, RankingSystem>): PromiseLike<{
    count: number
    scores: RankingSystemScore<ScoreId, Id, Mode, RankingSystem>[]
  }>
}
