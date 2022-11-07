import { TRPCError } from '@trpc/server'
import z from 'zod'
import { getFullUser, prismaClient as db, getBaseUser, getOneRelationShip, getRelationships } from '../../backend-clients'
import { createProtectedRouter } from '../controllers/protected/user'
import { calculateMutualRelationships } from '../../backend-clients/transforms'
import { zodHandle, zodRelationType } from '../shapes'

export const router = createProtectedRouter()
  .query('full-secret', {
    async resolve ({ ctx }) {
      return await getFullUser(ctx.user.id, { email: true, secrets: true })
    }
  })

  .query('relation', {
    input: z.object({
      target: zodHandle
    }),
    async resolve ({ input: { target }, ctx }) {
      const [fromUser, targetUser] = await Promise.all([ctx.user, getBaseUser(target)])
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
    async resolve ({ ctx }) {
      return await getRelationships(ctx.user)
    }
  })

  .mutation('remove-one-relation', {
    input: z.object({
      target: zodHandle,
      type: zodRelationType
    }),
    async resolve ({ input, ctx }) {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
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
