// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { sampleUserWithSecrets, scoped } from '@/prototyping/objects/user'

export const router = trpc.router()
  .query('public.user.full', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    resolve () {
      return sampleUserWithSecrets
    }
  })
  .query('public.user.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    resolve () {
      return sampleUserWithSecrets
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
