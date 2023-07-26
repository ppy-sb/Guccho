import { TRPCError } from '@trpc/server'
import { setCookie } from 'h3'
import { publicProcedure } from '../trpc'

import { unableToRefreshToken } from '../messages'

import { SessionProvider } from '$active/server'

const sessionProvider = new SessionProvider()

const config = {
  httpOnly: true,
}

export const sessionProcedure = publicProcedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session.id) {
      const sessionId = await sessionProvider.create(detectDevice(ctx.h3Event))
      setCookie(ctx.h3Event, 'session', sessionId, config)
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: sessionId,
          },
        }),
      })
    }
    const session = await sessionProvider.get(ctx.session.id)
    if (session == null) {
      const sessionId = await sessionProvider.create(detectDevice(ctx.h3Event))
      setCookie(ctx.h3Event, 'session', sessionId, config)
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: sessionId,
          },
        }),
      })
    }
    else {
      const refreshed = await sessionProvider.refresh(ctx.session.id)
      if (!refreshed) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: unableToRefreshToken,
        })
      }
      if (refreshed !== ctx.session.id) {
        setCookie(ctx.h3Event, 'session', refreshed, config)
      }

      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: refreshed,
          },
        }),
      })
    }
  })
  .use(async ({ ctx, next }) => {
    return await next({
      ctx: Object.assign(ctx, {
        session: Object.assign(ctx.session, {
          async getBinding<Additional extends Record<string, unknown>>() {
            if (!ctx.session.id) {
              return undefined
            }
            return (await sessionProvider.get(ctx.session.id)) as Awaited<ReturnType<typeof sessionProvider['get']>> & Partial<Additional>
          },
        }),
      }),
    })
  })
