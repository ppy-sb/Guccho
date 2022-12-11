import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import BanchoPyMap from '$/client/map'

const map = new BanchoPyMap()
export const router = _router({
  beatmapset: p.input(z.object({
    id: string(),
  })).query(async ({ input }) => {
    const { id } = input
    const bs = await map.getBeatmapset({ id })
    if (!bs)
      return
    return bs
  }),
})
