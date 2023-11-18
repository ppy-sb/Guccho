import { type Composition } from './@common.d'
import { IdTransformable } from './@extends'
import type { UserProvider } from './user'
import { type PaginatedResult } from '~/def/pagination'
import { type LeaderboardRankingSystem } from '~/def/common'

import type { Mode, Rank, Ruleset } from '~/def'

export namespace ClanProvider {

  export interface ClanCompact<Id> {
    id: Id
    name: string
    badge: string
    createdAt: Date
    owner: UserProvider.UserCompact<Id>
    avatarSrc?: string
    countUser: number
  }
  export interface ClanList<Id> extends ClanCompact<Id> {
    users: Pick<UserProvider.UserCompact<Id>, 'name' | 'avatarSrc'>[]
    sum: Record<Rank.PPv1 | Rank.PPv2, number> & Record<Rank.RankedScore | Rank.TotalScore, bigint>
  }
  export interface ClanDetail<Id> extends ClanCompact<Id> { }

  export interface SearchParam extends Composition.Pagination {
    mode: Mode
    ruleset: Ruleset
    rankingSystem: LeaderboardRankingSystem
    keyword: string
  }
  export interface DetailParam<Id> {
    id: Id
  }
  export interface UsersParam<Id> extends DetailParam<Id>, Composition.Pagination { }

  export type SearchResult<Id> = PaginatedResult<ClanList<Id>>
  export type DetailResult<Id> = ClanProvider.ClanDetail<Id>
  export type UsersResult<Id> = UserProvider.UserCompact<Id>[]
}

export abstract class ClanProvider<Id> extends IdTransformable {
  abstract search(opt: ClanProvider.SearchParam): PromiseLike<ClanProvider.SearchResult<Id>>
  abstract detail(opt: ClanProvider.DetailParam<Id>): PromiseLike<ClanProvider.DetailResult<Id>>
  abstract users(opt: ClanProvider.UsersParam<Id>): PromiseLike<ClanProvider.UsersResult<Id>>
}
