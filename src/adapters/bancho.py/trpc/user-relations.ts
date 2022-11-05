// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
// eslint-disable-next-line import/default
import { z } from 'zod'
import { prismaClient, getBaseUser, getOneRelationShip, getRelationships } from '../backend-clients'
import { calculateMutualRelationships } from '../backend-clients/transforms'
// eslint-disable-next-line import/no-named-as-default-member

export const router = trpc.router()

  .query('user.relation', {
    input: z.object({
      from: z.union([z.string(), z.number()]),
      target: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { from, target } }) {
      const [fromUser, targetUser] = await Promise.all([getBaseUser(from), getBaseUser(target)])
      if (!fromUser || !targetUser) { return }
      const [fromRelationship, targetRelationship] = await Promise.all([getOneRelationShip(fromUser, targetUser), getOneRelationShip(targetUser, fromUser)])
      const mutualRelationship = calculateMutualRelationships(fromRelationship, targetRelationship)
      return {
        from: fromRelationship,
        target: targetRelationship,
        mutual: mutualRelationship
      }
    }
  })

  .query('user.relations', {
    input: z.object({
      from: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { from } }) {
      const user = await getBaseUser(from)
      if (!user) { return }
      return await getRelationships(user)
    }
  })

  .query('user.count-relations', {
    input: z.object({
      handle: z.union([z.string(), z.number()]),
      type: z.union([z.literal('friend'), z.literal('block')])
    }),
    async resolve ({ input: { handle, type } }) {
      const user = await getBaseUser(handle)
      if (!user) { return }
      const count = await prismaClient.relationship.count({
        where: {
          toUserId: user.id,
          type
        }
      })
      return count
    }
  })
