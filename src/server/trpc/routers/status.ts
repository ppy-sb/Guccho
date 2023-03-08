import { StatusProvider } from '~/adapters/ppy.sb@bancho.py/server'

import { publicProcedure as p, router as _router } from '../trpc'

const sp = new StatusProvider()
export const router = _router({
  ready: p.query(() => sp.ready()),
  public: p.query(() => sp.public()),
})
