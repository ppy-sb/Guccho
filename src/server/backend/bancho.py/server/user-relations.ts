import { dedupeUserRelationship, fromBanchoPyRelationType, idToString, stringToId, toBanchoPyRelationType, toUserEssential } from '../transforms'

// import { idToString, stringToId } from '../transforms'
import type { Id } from '..'
import { getPrismaClient } from './source/prisma'
import { env } from '~/server/env'

import type { UserRelationProvider as Base } from '$base/server'
import { Relationship } from '~/def'
import type { UserEssential } from '~/def/user'

export class UserRelationProvider implements Base<Id> {
  static stringToId = stringToId
  static idToString = idToString
  db = getPrismaClient()

  config = {
    avatar: {
      domain: env.AVATAR_DOMAIN,
    },
  }

  async getOne(fromUser: { id: Id }, toUser: { id: Id }) {
    const relationships = await this.db.relationship.findFirst({
      where: {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
      },
      select: {
        type: true,
      },
    })
    if (!relationships) {
      return undefined
    }
    switch (relationships.type) {
      case 'friend': return Relationship.Friend
      case 'block': return Relationship.Blocked
      default: assertNotReachable(relationships.type)
    }
  }

  async get({ user }: { user: { id: Id } }) {
    const pRelationResult = this.db.relationship.findMany({
      where: {
        fromUserId: user.id,
      },
      select: {
        type: true,
        toUser: true,
        toUserId: true,
      },
    })
    const pGotRelationResult = this.db.relationship.findMany({
      where: {
        toUserId: user.id,
      },
      select: {
        type: true,
        fromUserId: true,
      },
    })

    const [relationships, gotRelationships] = await Promise.all([
      pRelationResult.then(r => r.map(_r => ({ ..._r, type: fromBanchoPyRelationType(_r.type) }))),
      pGotRelationResult.then(r => r.map(_r => ({ ..._r, type: fromBanchoPyRelationType(_r.type) }))),
    ])

    const transformed = relationships.map(r => ({
      ...r,
      toUser: toUserEssential(r.toUser, this.config),
    }))
    const deduped = dedupeUserRelationship(transformed)

    for (const _user of deduped) {
      const reverse = gotRelationships
        .filter(reverse => reverse.fromUserId === _user.id)
        .map(rev => rev.type)
      _user.relationshipFromTarget = reverse
      _user.mutualRelationship = calculateMutualRelationships(
        _user.relationship,
        _user.relationshipFromTarget
      )
    }

    return deduped
  }

  async removeOne({
    fromUser,
    targetUser,
    type,
  }: {
    fromUser: UserEssential<Id>
    targetUser: UserEssential<Id>
    type: Relationship
  }) {
    // bancho.py only allows one relationshipType per direction per one user pair
    // so cannot delete with where condition due to prisma not allowing it.
    // So to make sure that we are removing right relationship, we have to compare
    // relation type against input before remove it.
    const relationship = await this.getOne(fromUser, targetUser)

    if (relationship !== type) {
      throw new Error('not-found')
    }

    await this.db.relationship.delete({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: targetUser.id,
        },
      },
    })
  }

  async createOneRelationship({
    fromUser,
    targetUser,
    type,
  }: {
    fromUser: UserEssential<Id>
    targetUser: UserEssential<Id>
    type: Relationship
  }) {
    // bancho.py only allows one relationshipType per direction per one user pair
    // so cannot delete with where condition due to prisma not allowing it.
    // So to make sure that we are removing right relationship, we have to compare
    // relation type against input before remove it.
    const relationship = await this.getOne(fromUser, targetUser)

    if (relationship) {
      throw new Error('has-relationship')
    }

    await this.db.relationship.create({
      data: {
        fromUserId: fromUser.id,
        toUserId: targetUser.id,
        type: toBanchoPyRelationType(type),
      },
    })
  }

  async count({ user, type }: { user: UserEssential<Id>; type: Relationship }) {
    return await this.db.relationship.count({
      where: {
        toUserId: user.id,
        type: toBanchoPyRelationType(type),
      },
    })
  }
}
