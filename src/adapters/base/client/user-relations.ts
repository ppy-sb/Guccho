import type { Awaitable, Relationship } from '~/types/common'
import type { UserEssential } from '~/types/user'
import type { UserRelationship } from '~/types/user-relationship'

export interface UserRelationshipDataProvider<Id> {
  get(query: { user: { id: Id } }): Awaitable<UserRelationship<Id>[]>
  getOne(
    fromUser: { id: Id },
    toUser: { id: Id }
  ): Awaitable<Relationship | void>
  removeOne(query: {
    fromUser: UserEssential<Id>
    targetUser: UserEssential<Id>
    type: Relationship
  }): Awaitable<void>
  count(query: {
    user: UserEssential<Id>
    type: Relationship
  }): Awaitable<number>
}
