import { router } from '../trpc'

// routers
import { router as admin } from './admin'
import { router as article } from './article'
import { router as clan } from './clan'
import { router as mail } from './mail'
import { router as map } from './map'
import { router as me } from './me'
import { router as rank } from './rank'
import { router as score } from './score'
import { router as session } from './session'
import { router as status } from './status'
import { router as user } from './user'

export const appRouter = router({
  admin,

  session,
  me,

  article,
  clan,
  map,
  user,
  rank,
  score,
  status,
  mail,
})

// export type definition of API
export type AppRouter = typeof appRouter
