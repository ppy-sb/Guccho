import type { idTransformable } from './@extends'
import type { Relationship } from '~/def'
import type { UserCompact } from '~/def/user'
import type { UserRelationship } from '~/def/user-relationship'

export interface UserRelationProvider<Id> extends idTransformable {
  get(query: { user: { id: Id } }): PromiseLike<Array<UserCompact<Id> & UserRelationship>>
  getOne(
    fromUser: { id: Id },
    toUser: { id: Id }
  ): PromiseLike<Relationship | void>
  removeOne(query: {
    fromUser: UserCompact<Id>
    targetUser: UserCompact<Id>
    type: Relationship
  }): PromiseLike<void>
  count(query: {
    user: UserCompact<Id>
    type: Relationship
  }): PromiseLike<number>
}
