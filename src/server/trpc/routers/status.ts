import { router as _router, publicProcedure as p } from '../trpc'
import { StatusProvider } from '~/adapters/ppy.sb@bancho.py/server'

const sp = new StatusProvider()
export const router = _router({
  ready: p.query(() => sp.ready()),
  public: p.query(() => sp.public()),
})
