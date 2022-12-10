import { z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { zodIdType } from '$/shapes/index'
import BanchoPyLeaderboard from '$/client/leaderboard'

const leaderboard = new BanchoPyLeaderboard()
export const router = _router({
  beatmapset: p.input(z.object({
    id: zodIdType,
  })).query(({ ctx, input }) => {
    return {
      hello: 'hi',
    }
  }),
})
