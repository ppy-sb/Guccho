import {
  PrismaClient
} from '@prisma/client'

import type { IdType as Id } from '../config'
import { calculateMutualRelationships, dedupeUserRelationship, toBaseUser } from './transforms'

const prismaClient = new PrismaClient()

export const getOneRelationShip = async (fromUser: {id: Id}, toUser: {id: Id}) => {
  const relationships = await prismaClient.relationship.findMany({
    where: {
      fromUserId: fromUser.id,
      toUserId: toUser.id
    },
    select: {
      type: true
    }
  })
  return relationships.map(rel => rel.type)
}

export const getRelationships = async (user: {id: Id}) => {
  const pRelationResult = prismaClient.relationship.findMany({
    where: {
      fromUserId: user.id
    },
    select: {
      type: true,
      toUser: true,
      toUserId: true
    }
  })
  const pGotRelationResult = prismaClient.relationship.findMany({
    where: {
      toUserId: user.id
    },
    select: {
      type: true,
      fromUserId: true
    }
  })

  const [relationships, gotRelationships] = await Promise.all([pRelationResult, pGotRelationResult])

  const convertedToBaseUserShape = relationships.map(r => ({
    ...r,
    toUser: toBaseUser(r.toUser)
  }))
  const deduped = dedupeUserRelationship(convertedToBaseUserShape)

  for (const _user of deduped) {
    const reverse = gotRelationships.filter(reverse => reverse.fromUserId === user.id).map(reverse => reverse.type)
    _user.relationshipFromTarget = reverse || []
    _user.mutualRelationship = calculateMutualRelationships(_user.relationship, _user.relationshipFromTarget)
  }

  return deduped
}
