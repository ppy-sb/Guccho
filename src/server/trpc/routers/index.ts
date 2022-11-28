import { router } from '../trpc'

// routers
import { router as user } from './user'
import { router as session } from './session'
import { router as me } from './me'
import { router as leaderboard } from './leaderboard'

export const appRouter = router({
  session,
  me,

  user,
  leaderboard,
})

// export type definition of API
export type AppRouter = typeof appRouter
