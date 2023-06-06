import type { JSONContent } from '@tiptap/core'
import type { idTransformable } from './@extends'
import type { BeatmapSource, RankingStatus } from '~/types/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
} from '~/types/common'
import type { RankingSystemScore } from '~/types/score'
import type {
  UserEssential,
  UserExtra,
  UserOptional,
  UserStatistic,
  UserStatus,
} from '~/types/user'

export namespace UserProvider {
  export type ComposableProperties<Id> = UserExtra<Id> & UserOptional
  export interface OptType<
    Id,
    Includes extends Partial<Record<keyof UserOptional, boolean>> = Record<
      never,
      never
    >,
  > {
    handle: string
    includes?: Includes
    keys?: Array<['id', 'name', 'safeName', 'email'][number]>
  }

  export interface BaseQuery<Id, _Mode extends ActiveMode, _Ruleset extends ActiveRuleset, TRankingSystem extends LeaderboardRankingSystem> {
    id: Id
    mode: _Mode
    ruleset: _Ruleset
    rankingSystem: TRankingSystem
    page: number
    perPage: number
    rankingStatus: RankingStatus[]
  }
}
export interface UserProvider<Id> extends idTransformable {
  exists({ handle, keys }: UserProvider.OptType<Id>): PromiseLike<boolean>

  getEssential<
    Includes extends Partial<Record<keyof UserOptional, boolean>>,
  >(
    opt: UserProvider.OptType<Id, Includes>
  ): PromiseLike<UserEssential<Id>>

  getEssentialById<
    Includes extends Partial<Record<keyof UserOptional, boolean>>,
  >(opt: {
    id: Id
    includes: Includes
  }): PromiseLike<UserEssential<Id>>

  getBests<
    _Mode extends ActiveMode,
    _Ruleset extends ActiveRuleset,
    _RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, _Mode, _Ruleset, _RankingSystem>): PromiseLike<RankingSystemScore<string, Id, _Mode, _RankingSystem>[]>

  getTops<
    _Mode extends ActiveMode,
    _Ruleset extends ActiveRuleset,
    _RankingSystem extends LeaderboardRankingSystem,
  >(query: UserProvider.BaseQuery<Id, _Mode, _Ruleset, _RankingSystem>): PromiseLike<{
    count: number
    scores: RankingSystemScore<string, Id, _Mode, _RankingSystem>[]
  }>

  getStatistics(query: {
    id: Id
    country: string
  }): PromiseLike<UserStatistic>

  getFull<
    Excludes extends Partial<
      Record<keyof UserProvider.ComposableProperties<Id>, boolean>
    >,
  >(query: {
    handle: string
    excludes?: Excludes
    includeHidden?: boolean
  }): PromiseLike<
    | (UserEssential<Id> & {
      [K in keyof UserProvider.ComposableProperties<Id> as Exclude<
          Excludes,
          'secrets'
        >[K] extends true
        ? never
        : K]: UserProvider.ComposableProperties<Id>[K];
    } & (Excludes['secrets'] extends true
      ? { secrets: UserProvider.ComposableProperties<Id>['secrets'] }
      : {}))
  >

  changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
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

  register(opt: { name: string; safeName: string; email: string; passwordMd5: string }): PromiseLike<UserEssential<Id>>
}
