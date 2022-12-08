import type { Awaitable, Mode, Range, RankingSystem, Ruleset } from '~/types/common'
import type { BaseUser, UserExtra, UserOptional, UserStatistic } from '~~/src/types/user'
import type { RankingSystemScore } from '~~/src/types/score'

export namespace UserDataProvider {
  export type ComposableProperties<Id> = UserExtra<Id> & UserOptional<Id>
  export interface OptType<
  IdType,
  Includes extends Partial<Record<keyof UserOptional<IdType>, boolean>> = Record<
    never,
    never
  >,
> {
    handle: string | IdType
    includes?: Includes
    keys?: Array<['id', 'name', 'safeName', 'email'][number]>
  }
}
export abstract class UserDataProvider<Id> {
  abstract userExists({ handle, keys }: UserDataProvider.OptType<Id>): Awaitable<boolean>
  abstract getBaseUser<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: UserDataProvider.OptType<Id, Includes>): Awaitable<BaseUser<Id> | null>
  abstract getBaseUsers<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: { handle: string | Id; includes?: Includes }): Awaitable<BaseUser<Id>[]>
  abstract getBests<_Mode extends Mode, _Ruleset extends Ruleset, _RankingSystem extends RankingSystem>({
    id,
    mode,
    ruleset,
    rankingSystem,
    page,
    perPage,
  }: {
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

  abstract getStatisticsOfUser({
    id,
    country,
  }: {
    id: Id
    country: string
  }): Awaitable<UserStatistic<Id>>

  abstract getFullUser<Excludes extends Partial<Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>>>({ handle, excludes }: { handle: string | Id; excludes?: Excludes }):
  Awaitable<
    (
      null |
      BaseUser<Id>
      & ({
        [K in keyof UserDataProvider.ComposableProperties<Id> as Exclude<Excludes, 'secrets'>[K] extends true ? never : K]: UserDataProvider.ComposableProperties<Id>[K];
      })
      & (Excludes['secrets'] extends true ? { secrets: UserDataProvider.ComposableProperties<Id>['secrets'] } : {})
    )
  >

  abstract updateUser(
    user: BaseUser<Id>,
    input: {
      email?: string
      name?: string
      userpageContent?: string
    },
  ): Awaitable<BaseUser<Id>>

  abstract updateUserPassword(
    user: BaseUser<Id>,
    newPasswordMD5: string,
  ): Awaitable<BaseUser<Id>>
}
