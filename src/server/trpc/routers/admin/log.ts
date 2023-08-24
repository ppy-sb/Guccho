import { number } from 'zod'
import { logs as logs } from '~/server/singleton/service'
import { adminProcedure as pAdmin } from '~/server/trpc/middleware/admin'
import { router as _router } from '~/server/trpc/trpc'

export const router = _router({
  last: pAdmin.input(number()).query(async ({ input }) => {
    return await logs.get(input)
  }),
})
