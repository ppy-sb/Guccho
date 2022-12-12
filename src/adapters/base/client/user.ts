import type { Awaitable, GrandLeaderboardRankingSystem, Mode, Range, Ruleset } from '~/types/common'
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
export abstract class UserDataProvider<Id> {
  abstract exists({ handle, keys }: UserDataProvider.OptType<Id>): Awaitable<boolean>
  abstract getEssential<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: UserDataProvider.OptType<Id, Includes>): Awaitable<UserEssential<Id> | null>
  abstract getEssentials<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: { handle: string | Id; includes?: Includes }): Awaitable<UserEssential<Id>[]>
  abstract getBests<_Mode extends Mode, _Ruleset extends Ruleset, _RankingSystem extends GrandLeaderboardRankingSystem>(query: {
    id: Id
    mode: _Mode
    ruleset: _Ruleset
    rankingSystem: _RankingSystem
    page: Range<0, 10>
    perPage: Range<1, 11>
  }): Awaitable<RankingSystemScore<
    bigint,
    Id,
    _Mode,
    _RankingSystem & 'ppv2'
  >[]>

  abstract getStatistics(query: {
    id: Id
    country: string
  }): Awaitable<UserStatistic<Id>>

  abstract getFull<Excludes extends Partial<Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>>>(query: { handle: string | Id; excludes?: Excludes }):
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

  abstract changePreferences(
    user: UserEssential<Id>,
    input: {
      email?: string
      name?: string
      userpageContent?: string
    },
  ): Awaitable<UserEssential<Id>>

  abstract changePassword(
    user: UserEssential<Id>,
    newPasswordMD5: string,
  ): Awaitable<UserEssential<Id>>
}
