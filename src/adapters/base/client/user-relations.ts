import type { UserEssential, UserRelationship } from '~/types/user'
import type { Awaitable, Relationship } from '~/types/common'

export abstract class UserRelationshipDataProvider<Id> {
  abstract get(query: { user: { id: Id } }): Awaitable<UserRelationship<Id>[]>
  abstract getOne(fromUser: { id: Id }, toUser: { id: Id }): Awaitable<Relationship | void>
  abstract removeOne(query: { fromUser: UserEssential<Id>; targetUser: UserEssential<Id>; type: Relationship }): Awaitable<void>
  abstract count(query: { user: UserEssential<Id>; type: Relationship }): Awaitable<number>
}
