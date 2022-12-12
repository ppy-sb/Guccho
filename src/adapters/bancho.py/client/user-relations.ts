import type { PrismaClient } from '@prisma/client'
import type { Id } from '../config'
import { dedupeUserRelationship, toUserEssential } from '../transforms'

import { prismaClient } from './index'
import type { UserRelationshipDataProvider } from '$def/client/user-relations'
import type { UserEssential } from '~/types/user'
import type { Relationship } from '~/types/common'
import { calculateMutualRelationships } from '~/server/transforms'

export default class BanchoPyUserRelationship implements UserRelationshipDataProvider<Id> {
  db: PrismaClient
  constructor({ client }: { client: PrismaClient } = { client: prismaClient }) {
    this.db = client
  }

  async getOne(fromUser: { id: Id }, toUser: { id: Id }) {
    const relationships = await prismaClient.relationship.findFirst({
      where: {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
      },
      select: {
        type: true,
      },
    })
    return relationships?.type
  }

  async get({ user }: { user: { id: Id } }) {
    const pRelationResult = prismaClient.relationship.findMany({
      where: {
        fromUserId: user.id,
      },
      select: {
        type: true,
        toUser: true,
        toUserId: true,
      },
    })
    const pGotRelationResult = prismaClient.relationship.findMany({
      where: {
        toUserId: user.id,
      },
      select: {
        type: true,
        fromUserId: true,
      },
    })

    const [relationships, gotRelationships] = await Promise.all([pRelationResult, pGotRelationResult])

    const asUserEssentialShape = relationships.map(r => ({
      ...r,
      toUser: toUserEssential({ user: r.toUser }),
    }))
    const deduped = dedupeUserRelationship(asUserEssentialShape)

    for (const _user of deduped) {
      const reverse = gotRelationships.filter(reverse => reverse.fromUserId === user.id).map(reverse => reverse.type)
      _user.relationshipFromTarget = reverse || []
      _user.mutualRelationship = calculateMutualRelationships(_user.relationship, _user.relationshipFromTarget)
    }

    return deduped
  }

  async removeOne({ fromUser, targetUser, type }: { fromUser: UserEssential<Id>; targetUser: UserEssential<Id>; type: Relationship }) {
  // bancho.py only allows one relationshipType per direction per one user pair
  // so cannot delete with where condition due to prisma not allowing it.
  // So to make sure that we are removing right relationship, we have to compare
  // relation type against input before remove it.
    const relationship = await this.getOne(fromUser, targetUser)

    if (relationship !== type)
      throw new Error('not-found')

    await prismaClient.relationship.delete({
      where: {
        fromUserId_toUserId: {
          fromUserId: fromUser.id,
          toUserId: targetUser.id,
        },
      },
    })
  }

  async createOneRelationship({ fromUser, targetUser, type }: { fromUser: UserEssential<Id>; targetUser: UserEssential<Id>; type: Relationship }) {
  // bancho.py only allows one relationshipType per direction per one user pair
  // so cannot delete with where condition due to prisma not allowing it.
  // So to make sure that we are removing right relationship, we have to compare
  // relation type against input before remove it.
    const relationship = await this.getOne(fromUser, targetUser)

    if (relationship)
      throw new Error('has-relationship')

    await prismaClient.relationship.create({
      data: {
        fromUserId: fromUser.id,
        toUserId: targetUser.id,
        type,
      },
    })
  }

  // TODO: handle the situation where toUser could be null.
  async count({ user, type }: { user: UserEssential<Id>; type: Relationship }) {
    return await prismaClient.relationship.count({
      where: {
        toUserId: user.id,
        type,
      },
    })
  }
}

