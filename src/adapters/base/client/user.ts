import type { JSONContent } from '@tiptap/core'
import type { RankingStatus } from '~/types/beatmap'
import type {
  Awaitable,
  LeaderboardRankingSystem,
  Mode,
  Ruleset,
} from '~/types/common'
import type { RankingSystemScore } from '~/types/score'
import type {
  UserEssential,
  UserExtra,
  UserOptional,
  UserStatistic,
} from '~/types/user'

export namespace UserDataProvider {
  export type ComposableProperties<Id> = UserExtra<Id> & UserOptional<Id>
  export interface OptType<
    Id,
    Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
      never,
      never
    >,
  > {
    handle: string
    includes?: Includes
    keys?: Array<['id', 'name', 'safeName', 'email'][number]>
  }

  export interface BaseQuery<Id, _Mode extends Mode, _Ruleset extends Ruleset, TRankingSystem extends LeaderboardRankingSystem> {
    id: Id
    mode: _Mode
    ruleset: _Ruleset
    rankingSystem: TRankingSystem
    page: number
    perPage: number
    rankingStatus: RankingStatus[]
  }
}
export interface UserDataProvider<Id> {
  exists({ handle, keys }: UserDataProvider.OptType<Id>): Awaitable<boolean>

  getEssential<
    Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>,
  >(
    opt: UserDataProvider.OptType<Id, Includes>
  ): Awaitable<UserEssential<Id> | null>

  getEssentialById<
    Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>,
  >(opt: {
    id: Id
    includes: Includes
  }): Awaitable<UserEssential<Id> | null>

  getBests<
    _Mode extends Mode,
    _Ruleset extends Ruleset,
    _RankingSystem extends LeaderboardRankingSystem,
  >(query: UserDataProvider.BaseQuery<Id, _Mode, _Ruleset, _RankingSystem>): Awaitable<RankingSystemScore<string, Id, _Mode, _RankingSystem>[]>

  getTops<
    _Mode extends Mode,
    _Ruleset extends Ruleset,
    _RankingSystem extends LeaderboardRankingSystem,
  >(query: UserDataProvider.BaseQuery<Id, _Mode, _Ruleset, _RankingSystem>): Awaitable<{
    count: number
    scores: RankingSystemScore<string, Id, _Mode, _RankingSystem>[]
  }>

  getStatistics(query: {
    id: Id
    country: string
  }): Awaitable<UserStatistic>

  getFull<
    Excludes extends Partial<
      Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>
    >,
  >(query: {
    handle: string
    excludes?: Excludes
  }): Awaitable<
    | null
    | (UserEssential<Id> & {
      [K in keyof UserDataProvider.ComposableProperties<Id> as Exclude<
          Excludes,
          'secrets'
        >[K] extends true
        ? never
        : K]: UserDataProvider.ComposableProperties<Id>[K];
    } & (Excludes['secrets'] extends true
      ? { secrets: UserDataProvider.ComposableProperties<Id>['secrets'] }
      : {}))
  >

  changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
    }
  ): Awaitable<UserEssential<Id>>

  changeUserpage(
    user: { id: Id },
    input: {
      profile: JSONContent
    }
  ): Awaitable<{
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
  ): Awaitable<UserEssential<Id>>

  changePassword(
    user: { id: Id },
    newPasswordMD5: string
  ): Awaitable<UserEssential<Id>>

  changeAvatar(user: { id: Id }, avatar: Buffer | Uint8Array): Awaitable<string>

  search(opt: {
    keyword: string
    limit: number
  }): Awaitable<UserEssential<Id>[]>
}
