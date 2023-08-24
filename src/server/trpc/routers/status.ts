import { router as _router, publicProcedure as p } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { ServiceStatusProvider } from '$active/server'

export const router = _router({
  public: p.query(ServiceStatusProvider.reportStatus),
  metrics: adminProcedure.query(ServiceStatusProvider.metrics),
  config: adminProcedure.query(ServiceStatusProvider.config),
})
