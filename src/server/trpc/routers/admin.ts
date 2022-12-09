import { adminProcedure as pAdmin } from '../middleware/admin'
import { router as _router } from '../trpc'
export const router = _router({
  serverStatus: pAdmin.query(() => {
    return {
      t: 1,
    }
  }),
})
