import * as trpc from '@trpc/server'
import { ServerRulesetConfig } from '../config'
import { router as user } from './user'

export const router =
trpc.router()
  .merge(user)
  .query('ranking-system-config', {
    resolve () {
      return ServerRulesetConfig
    }
  })

  .query('server-has-owner', {
    resolve () {
      return false
    }
  })
