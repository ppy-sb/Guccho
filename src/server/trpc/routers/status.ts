import { router as _router, publicProcedure as p } from '../trpc'
import { adminProcedure } from '../middleware/admin'
import { serviceStatuses } from '~/server/singleton/service'
import { MonitorProvider } from '$active/server'

export const router = _router({
  public: p.query(serviceStatuses.reportStatus),
  metrics: adminProcedure.query(MonitorProvider.metrics),
  config: adminProcedure.query(MonitorProvider.config),
})
