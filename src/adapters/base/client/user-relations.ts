import type { BaseUser, UserRelationship } from '~/types/user'
import type { Awaitable, Relationship } from '~/types/common'

export abstract class UserRelationshipDataProvider<Id> {
  abstract getRelationships({ user }: { user: { id: Id } }): Awaitable<UserRelationship<Id>[]>
  abstract getOneRelationship(fromUser: { id: Id }, toUser: { id: Id }): Awaitable<Relationship | void>
  abstract removeOneRelationship({ fromUser, targetUser, type }: { fromUser: BaseUser<Id>; targetUser: BaseUser<Id>; type: Relationship }): Awaitable<void>
  abstract countRelationship({ user, type }: { user: BaseUser<Id>; type: Relationship }): Awaitable<number>
}
