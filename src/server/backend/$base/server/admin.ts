import { IdTransformable } from './@extends'
import type { UserClan, UserCompact, UserOptional } from '~/def/user'

export abstract class AdminProvider<Id> extends IdTransformable {
  abstract userList(query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> & {
    page: number
    perPage: number
  }):
  Promise<
    readonly [
      number,
      Array<
        UserCompact<Id>
        & Pick<UserOptional, 'email' | 'status'>
        & {
          registeredAt: Date
          lastActivityAt: Date
          clan?: UserClan<Id>
        }
      >,
    ]
  >
  abstract userDetail(query: { id: Id }): PromiseLike<UserCompact<Id> & UserOptional>
  abstract updateUserDetail(query: { id: Id }, updateFields: Partial<UserCompact<Id> & UserOptional>): PromiseLike<UserCompact<Id> & UserOptional>
}
