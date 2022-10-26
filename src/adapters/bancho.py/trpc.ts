// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { getBaseUser, getFullUser } from './backend-client'

import { rulesetConfig } from './config'

export const router = trpc.router()
  .query('getFullUser', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, false)
      return user
    }
  })
  .query('getSecretFullUser', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getFullUser(input.handle, true)
      return user
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
  .query('getRankingSystems', {
    resolve () {
      return rulesetConfig
    }
  })
