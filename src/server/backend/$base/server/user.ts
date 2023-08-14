import type { JSONContent } from '@tiptap/core'
import type { ExtractLocationSettings, ExtractSettingType } from '../@define-setting'
import type { idTransformable } from './@extends'
import type { BeatmapSource, RankingStatus } from '~/def/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
} from '~/def/common'
import type { RankingSystemScore } from '~/def/score'
import type {
  DynamicSettingStore,
  Scope,
  UserEssential,
  UserExtra,
  UserOptional,
  UserSecrets,
  UserStatistic,
  UserStatus,
} from '~/def/user'
import type { CountryCode } from '~/def/country-code'
import type { settings } from '$active/dynamic-settings'

export namespace UserProvider {
  export type ComposableProperties<Id> = UserExtra<Id> & UserOptional
  export interface OptType {
    handle: string
    keys?: Array<'id' | 'name' | 'safeName' | 'email'>
  }

  export interface BaseQuery<Id, Mode extends ActiveMode, Ruleset extends ActiveRuleset, RankingSystem extends LeaderboardRankingSystem> {
    id: Id
    mode: Mode
    ruleset: Ruleset
    rankingSystem: RankingSystem
    page: number
    perPage: number
    rankingStatus: RankingStatus[]
  }
}
export interface UserProvider<Id> extends idTransformable {
  exists({ handle, keys }: UserProvider.OptType): PromiseLike<boolean>

  getEssential<_Scope extends Scope>(
    opt: UserProvider.OptType & { scope: _Scope }
  ): Promise<_Scope extends Scope.Self ? UserEssential<Id> & UserSecrets : UserEssential<Id>>

  getEssentialById<_Scope extends Scope>(opt: {
    id: Id
    scope: _Scope
  }): Promise<_Scope extends Scope.Self ? UserEssential<Id> & UserSecrets : UserEssential<Id>>

  getBests<
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, Mode, Ruleset, RankingSystem>): PromiseLike<RankingSystemScore<string, Id, Mode, RankingSystem>[]>

  getTops<
    Mode extends ActiveMode,
    Ruleset extends ActiveRuleset,
    RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, Mode, Ruleset, RankingSystem>): PromiseLike<{
    count: number
    scores: RankingSystemScore<string, Id, Mode, RankingSystem>[]
  }>

  getStatistics(query: {
    id: Id
    flag: CountryCode
  }): PromiseLike<UserStatistic>

  getFull<
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
  UserEssential<Id> & {
    [K in keyof UserProvider.ComposableProperties<Id> as Excludes[K] extends true
      ? never
      : K
    ]: UserProvider.ComposableProperties<Id>[K];
  }
  >

  changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      flag?: CountryCode
    }
  ): PromiseLike<UserEssential<Id>>

  changeUserpage(
    user: { id: Id },
    input: {
      profile: JSONContent
    }
  ): PromiseLike<{
    html: string
    raw: JSONContent
  }>

  changeVisibility?(
    user: { id: Id },
    input: {
      email?: string
      name?: string
      userpageContent?: string
    }
  ): PromiseLike<UserEssential<Id>>

  changePassword(
    user: { id: Id },
    newPasswordMD5: string
  ): PromiseLike<UserEssential<Id>>

  changeAvatar(user: { id: Id }, avatar: Uint8Array): PromiseLike<string>

  search(opt: {
    keyword: string
    limit: number
  }): PromiseLike<UserEssential<Id>[]>

  count(opt: {
    keyword?: string
  }): PromiseLike<number>

  status({ id }: { id: Id }): PromiseLike<{
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

  register(opt: { name: string; safeName: string; email: string; passwordMd5: string }): PromiseLike<UserEssential<Id>>

  getDynamicSettings (user: { id: Id }): Promise<ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>>

  setDynamicSettings(user: { id: Id }, args: ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>): Promise<ExtractSettingType<ExtractLocationSettings<DynamicSettingStore.Server, typeof settings>>>
}
