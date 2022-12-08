import type { Mode, Range, RankingSystem, Ruleset } from '~/types/common'
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
export interface UserDataProvider<Id = unknown> {
  userExists({ handle, keys }: UserDataProvider.OptType<Id>): Promise<boolean>
  getBaseUser<Includes extends Partial<Record<keyof UserOptional<number>, boolean>>>(opt: UserDataProvider.OptType<Id, Includes>): Promise<BaseUser<Id> | null>
  getBaseUsers<Includes extends Partial<Record<keyof UserOptional<Id>, boolean>>>(opt: { handle: string | Id; includes?: Includes }): Promise<BaseUser<Id>[]>
  getBests<_Mode extends Mode, _Ruleset extends Ruleset, _RankingSystem extends RankingSystem>({
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
  }): Promise<RankingSystemScore<
    bigint,
    Id,
    _Mode,
    _RankingSystem & 'ppv2'
  >[]>

  getStatisticsOfUser({
    id,
    country,
  }: {
    id: Id
    country: string
  }): Promise<UserStatistic<Id>>

  getFullUser<Excludes extends Partial<Record<keyof UserDataProvider.ComposableProperties<Id>, boolean>>>({ handle, excludes }: { handle: string | Id; excludes?: Excludes }):
  Promise<
    (
      null |
      BaseUser<Id>
      & ({
        [K in keyof UserDataProvider.ComposableProperties<Id> as Exclude<Excludes, 'secrets'>[K] extends true ? never : K]: UserDataProvider.ComposableProperties<Id>[K];
      })
      & (Excludes['secrets'] extends true ? { secrets: UserDataProvider.ComposableProperties<Id>['secrets'] } : {})
    )
  >

  updateUser(
    user: BaseUser<Id>,
    input: {
      email?: string
      name?: string
      userpageContent?: string
    },
  ): Promise<BaseUser<Id>>

  updateUserPassword(
    user: BaseUser<Id>,
    newPasswordMD5: string,
  ): Promise<BaseUser<Id>>
}
