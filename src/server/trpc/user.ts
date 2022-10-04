import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
import { z } from 'zod'

export const router = trpc.router()
  .query('getUser', {
    input: z.object({
      id: z.string()
    }),
    async resolve ({ input: { id } }) {

    }
  })
