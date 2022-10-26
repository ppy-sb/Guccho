// ~/server/trpc/index.ts
// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'
import { getBaseUser, getFullUser } from './database-client'

const rulesetConfig = {
  ppv2: {
    userpage: {
      show: 'tab'
    },
    name: 'Performance(v2)'
  },
  ppv1: {
    userpage: {
      show: 'dropdown'
    },
    name: 'Performance(v1)'
  },
  rankedScore: {
    userpage: {
      show: 'tab'
    },
    name: 'Ranked Score'
  },
  totalScore: {
    userpage: {
      show: 'tab'
    },
    name: 'Total Score'
  }
}

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
