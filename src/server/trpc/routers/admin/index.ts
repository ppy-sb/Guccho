import { router as log } from './log'
import { adminProcedure as pAdmin } from '~/server/trpc/middleware/admin'
import { router as _router } from '~/server/trpc/trpc'

export const router = _router({
  log,
  serverStatus: pAdmin.query(() => {
    return {
      t: 1,
    }
  }),
})
