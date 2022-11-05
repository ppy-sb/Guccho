import * as trpc from '@trpc/server'
import { ServerRulesetConfig } from '../config'
import { router as user } from './user'
import { router as userRelation } from './user-relations'
import { router as session } from './session'

export const router =
trpc.router()
  .merge(session)
  .merge(user)
  .merge(userRelation)
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
