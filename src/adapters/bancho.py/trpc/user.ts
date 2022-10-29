// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { getBaseUser, getFullUser } from '../backend-clients'

import { ServerRulesetConfig } from '../config'

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
  .query('user.full+secret', {
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

  .query('users.base', {
    input: z.object({
      role: z.array(z.string())
    }),
    resolve ({ input }) {
      return []
    }
  })

  .query('ranking-system-config', {
    resolve () {
      return ServerRulesetConfig
    }
  })

  .query('server-has-owner', {
    resolve () {
      return false
    }
  })
