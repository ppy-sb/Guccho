// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { sampleUserWithSecrets, scoped } from '@/prototyping/objects/user'
const prisma = new PrismaClient()

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
    resolve () {
      return {
        id: sampleUserWithSecrets.id,
        ingameId: sampleUserWithSecrets.ingameId,
        name: sampleUserWithSecrets.name,
        safeName: sampleUserWithSecrets.safeName,
        email: sampleUserWithSecrets.email,
        flag: sampleUserWithSecrets.flag,
        avatarUrl: sampleUserWithSecrets.avatarUrl
      }
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
