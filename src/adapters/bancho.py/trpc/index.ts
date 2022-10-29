import * as trpc from '@trpc/server'
import { router as user } from './user'

export const router =
trpc.router()
  .merge(user)
