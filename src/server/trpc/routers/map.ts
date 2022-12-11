import { z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { zodIdType } from '$/shapes/index'
import BanchoPyMap from '$/client/map'

const map = new BanchoPyMap()
export const router = _router({
  beatmapset: p.input(z.object({
    id: zodIdType,
  })).query(async ({ input }) => {
    const { id } = input
    const bs = await map.getBeatmapset({ id })
    if (!bs)
      return
    return bs
  }),
})
