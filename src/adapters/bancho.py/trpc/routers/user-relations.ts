// TODO: change to me.relations
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouterWithSession } from '../controllers/session'
import { prismaClient as db, getBaseUser, getOneRelationShip, getRelationships } from '../../backend-clients'
import { calculateMutualRelationships } from '../../backend-clients/transforms'

const zodHandle = z.union([z.string(), z.number()])
const zodRelationType = z.union([z.literal('friend'), z.literal('block')])

export const router = createRouterWithSession()
  .query('relation', {
    input: z.object({
      from: zodHandle,
      target: zodHandle
    }),
    async resolve ({ input: { from, target } }) {
      const [fromUser, targetUser] = await Promise.all([getBaseUser(from), getBaseUser(target)])
      if (!fromUser || !targetUser) { return }
      const [fromRelationship, targetRelationship] = await Promise.all([getOneRelationShip(fromUser, targetUser), getOneRelationShip(targetUser, fromUser)])
      return {
        from: [fromRelationship],
        target: [targetRelationship],
        mutual: (fromRelationship && targetRelationship) && calculateMutualRelationships([fromRelationship], [targetRelationship])
      }
    }
  })

  .query('relations', {
    input: z.object({
      from: zodHandle
    }),
    async resolve ({ input: { from } }) {
      const user = await getBaseUser(from)
      if (!user) { return }
      return await getRelationships(user)
    }
  })

  .query('count-relations', {
    input: z.object({
      handle: zodHandle,
      type: zodRelationType
    }),
    async resolve ({ input: { handle, type } }) {
      const user = await getBaseUser(handle)
      if (!user) { return }
      const count = await db.relationship.count({
        where: {
          toUserId: user.id,
          type
        }
      })
      return count
    }
  })

  .mutation('remove-one-relation', {
    input: z.object({
      from: zodHandle,
      target: zodHandle,
      type: zodRelationType
    }),
    async resolve ({ input }) {
      const [fromUser, targetUser] = await Promise.all([
        getBaseUser(input.from),
        getBaseUser(input.target)
      ])
      if (!fromUser || !targetUser) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'at least one of the supplied user is not exist'
        })
      }
      // bancho.py only allows one relationshipType per direction per one user pair
      // so cannot delete with where condition due to prisma not allowing it.
      // So to make sure that we are removing right relationship, we have to compare
      // relation type against input before remove it.
      const relationship = await getOneRelationShip(fromUser, targetUser)

      if (relationship !== input.type) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'specified relation type in user not found'
        })
      }
      await db.relationship.delete({
        where: {
          fromUserId_toUserId: {
            fromUserId: fromUser.id,
            toUserId: targetUser.id
          }
        }
      })
    }
  })
