import { router } from '../trpc'

// routers
import { router as user } from './user'
import { router as session } from './session'
import { router as me } from './me'
import { router as leaderboard } from './leaderboard'
import { router as map } from './map'
import { router as search } from './search'
import { router as score } from './score'
import { router as status } from './status'

export const appRouter = router({
  session,
  me,

  user,
  leaderboard,
  map,
  search,
  score,
  status,
})

// export type definition of API
export type AppRouter = typeof appRouter
