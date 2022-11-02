// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getBaseUser, getFullUser, getBaseUsers, getOneRelationShip, countGotRelationship, getRelationships } from '../backend-clients'
import { calculateMutualRelationships, followUserPreferences } from '../backend-clients/transforms'
// eslint-disable-next-line import/no-named-as-default-member
const { compare } = bcrypt

export const router = trpc.router()

  .query('user.userpage', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getFullUser(handle, { relationships: false })
      if (!user) { return user }
      return followUserPreferences(user, 'public')
    }
  })

  .query('user.full', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getFullUser(handle, { email: true })
      if (!user) { return null }
      return followUserPreferences(user, 'public')
    }
  })

  .query('user.full-secret', {
    input: z.object({
      handle: z.union([z.string(), z.number()]),
      md5HashedPassword: z.string()
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, { email: true, secrets: true })
      if (!user) { return false }
      const result = await compare(input.md5HashedPassword, user.secrets.password)
      if (!result) { return false }
      return user
    }
  })

  .query('user.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getBaseUser(input.handle)
      return user
    }
  })

  .query('user.login', {
    input: z.object({
      handle: z.union([z.string(), z.number()]),
      md5HashedPassword: z.string()
    }),
    async resolve ({ input: { handle, md5HashedPassword } }) {
      try {
        const user = await getBaseUser(handle, { secrets: true })
        if (!user) { return false }
        const result = await compare(md5HashedPassword, user.secrets.password)
        if (!result) { return false }
        return user
      } catch (err) {
        console.error(err)
        throw err
      }
    }
  })

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

  .query('user.count-friends', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getBaseUser(handle)
      if (!user) { return }
      return await countGotRelationship(user, 'friend')
    }
  })

// TODO: get user relations
// .query('user-relations', {})

  .query('users.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      return await getBaseUsers(input.handle)
    }
  })
