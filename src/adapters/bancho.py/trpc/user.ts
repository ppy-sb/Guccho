// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getBaseUser, getFullUser, getBaseUsers } from '../backend-clients'

export const router = trpc.router()
  .query('user.full', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, false)
      return user
    }
  })
  .query('user.full-secret', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, true)
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
        const user = await getFullUser(handle, true)
        if (!user) { return false }
        const result = await bcrypt.compare(md5HashedPassword, user.secrets.password)
        if (!result) { return false } else {
          const _user = {
            ...user,
            statistics: undefined
          }
          return _user as Omit<typeof user, 'statistics'>
        }
      } catch (err) {
        console.error(err)
        throw err
      }
    }
  })

  .query('users.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      return await getBaseUsers(input.handle)
    }
  })
