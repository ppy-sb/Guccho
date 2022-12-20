import type { JSONContent } from '@tiptap/core'
import type { Awaitable, OverallLeaderboardRankingSystem, Mode, NumberRange, Ruleset } from '~/types/common'
import type { UserEssential, UserExtra, UserOptional, UserStatistic } from '~/types/user'
import type { RankingSystemScore } from '~/types/score'

export namespace UserDataProvider {
  export type ComposableProperties<Id> = UserExtra<Id> & UserOptional<Id>
  export interface OptType<
  Id,
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
    never,
    never
  >,
> {
    handle: string | Id
    includes?: Includes
    keys?: Array<['id', 'name', 'safeName', 'email'][number]>
  }
}
export interface UserDataProvider<Id> {
  exists({ handle, keys }: UserDataProvider.OptType<Id>): Awaitable<boolean>
  getEssential<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: UserDataProvider.OptType<Id, Includes>): Awaitable<UserEssential<Id> | null>
  getEssentials<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: { handle: string | Id; includes?: Includes }): Awaitable<UserEssential<Id>[]>
  getBests<_Mode extends Mode, _Ruleset extends Ruleset, _RankingSystem extends OverallLeaderboardRankingSystem>(query: {
    id: Id
    mode: _Mode
    ruleset: _Ruleset
    rankingSystem: _RankingSystem
    page: NumberRange<0, 10>
    perPage: NumberRange<1, 11>
  }): Awaitable<RankingSystemScore<
    bigint,
    Id,
    _Mode,
    _RankingSystem & 'ppv2'
  >[]>

  getStatistics(query: {
    id: Id
    country: string
  }): Awaitable<UserStatistic<Id>>

  getFull<Excludes extends Partial<Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>>>(query: { handle: string | Id; excludes?: Excludes }):
  Awaitable<
    (
      null |
      UserEssential<Id>
      & ({
        [K in keyof UserDataProvider.ComposableProperties<Id> as Exclude<Excludes, 'secrets'>[K] extends true ? never : K]: UserDataProvider.ComposableProperties<Id>[K];
      })
      & (Excludes['secrets'] extends true ? { secrets: UserDataProvider.ComposableProperties<Id>['secrets'] } : {})
    )
  >

  changeSettings(
    user: { id: Id },
    input: {
      email?: string
      name?: string
    },
  ): Awaitable<UserEssential<Id>>

  changeUserpage(
    user: { id: Id },
    input: {
      profile: JSONContent
    },
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
    },
  ): Awaitable<UserEssential<Id>>

  changePassword(
    user: { id: Id },
    newPasswordMD5: string,
  ): Awaitable<UserEssential<Id>>

}
