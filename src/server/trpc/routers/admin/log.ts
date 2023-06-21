import { number } from 'zod'
import { adminProcedure as pAdmin } from '~/server/trpc/middleware/admin'
import { router as _router } from '~/server/trpc/trpc'
import { LogProvider } from '$active/server'

const log = new LogProvider()
export const router = _router({
  last: pAdmin.input(number()).query(async ({ input }) => {
    return await log.get(input)
  }),
})
