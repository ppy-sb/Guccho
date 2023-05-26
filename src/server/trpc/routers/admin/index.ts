import { adminProcedure as pAdmin } from '../../middleware/admin'
import { router as _router } from '../../trpc'

import { router as log } from './log'

export const router = _router({
  log,
  serverStatus: pAdmin.query(() => {
    return {
      t: 1,
    }
  }),
})
