import * as trpc from '@trpc/server'
import { type Context as _Context } from './'
export const createRouter = <Context = _Context>() => trpc.router<Context>()
