import { IdTransformable } from './@extends'
import type { Relationship } from '~/def'
import type { UserCompact } from '~/def/user'
import type { UserRelationship } from '~/def/user-relationship'

export abstract class UserRelationProvider<Id> extends IdTransformable {
  abstract get(query: { user: { id: Id } }): PromiseLike<Array<UserCompact<Id> & UserRelationship>>
  abstract getOne(
    fromUser: { id: Id },
    toUser: { id: Id }
  ): PromiseLike<Relationship | void>
  abstract removeOne(query: {
    fromUser: UserCompact<Id>
    targetUser: UserCompact<Id>
    type: Relationship
  }): PromiseLike<void>
  abstract count(query: {
    user: UserCompact<Id>
    type: Relationship
  }): PromiseLike<number>
}
