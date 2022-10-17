// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { prisma, getBaseUser } from './database-client'
import { sampleUserWithSecrets, scoped } from '@/prototyping/objects/user'

export const router = trpc.router()
  .query('getFirstUser', {
    async resolve () {
      const user = await prisma.user.findFirst()
      if (!user) { return undefined }
      return user
    }
  })
  .query('getFullUser', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    resolve () {
      return sampleUserWithSecrets
    }
  })
  .query('getBaseUser', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getBaseUser(input.handle)
      return user
    }
  })
  .query('getUsers', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    resolve () {
      return Object.values(scoped).map(user => ({
        id: user.id,
        ingameId: user.ingameId,
        name: user.name,
        safeName: user.safeName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        flag: user.flag
      }))
    }
  })
