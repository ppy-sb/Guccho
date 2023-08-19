import { router } from '../trpc'

// routers
import { router as rank } from './rank'
import { router as map } from './map'
import { router as me } from './me'
import { router as score } from './score'
import { router as search } from './search'
import { router as session } from './session'
import { router as status } from './status'
import { router as user } from './user'
import { router as article } from './article'
import { router as admin } from './admin'

export const appRouter = router({
  admin,

  session,
  me,

  user,
  rank,
  map,
  search,
  score,
  status,
  article,
})

// export type definition of API
export type AppRouter = typeof appRouter
