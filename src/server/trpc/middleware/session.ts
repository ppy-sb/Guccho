import { TRPCError } from '@trpc/server'
import { setCookie } from 'h3'
import { publicProcedure } from '../trpc'

import { unableToRefreshToken } from '../messages'
import { createSession, getSession, refresh } from '~/server/session'

export const sessionProcedure = publicProcedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session.id) {
      const sessionId = await createSession()
      // TODO: not sure if it needs await but got several code: 'ERR_HTTP_HEADERS_SENT' reports
      await setCookie(ctx.h3Event, 'session', sessionId)
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: ctx.session.id,
          },
        }),
      })
    }
    const session = await getSession(ctx.session.id)
    if (session == null) {
      const sessionId = await createSession()
      await setCookie(ctx.h3Event, 'session', sessionId)
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: ctx.session.id,
          },
        }),
      })
    }
    else {
      const refreshed = await refresh(ctx.session.id)
      if (!refreshed) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: unableToRefreshToken,
        })
      }
      if (refreshed !== ctx.session.id)
        await setCookie(ctx.h3Event, 'session', refreshed)

      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: ctx.session.id,
          },
        }),
      })
    }
  })
  .use(async ({ ctx, next }) => {
    return await next({
      ctx: {
        ...ctx,
        session: Object.assign(ctx.session, {
          async getBinding<Additional extends Record<string, any>>() {
            type _ReturnType = Awaited<ReturnType<typeof getSession>> & Partial<Additional>
            if (!ctx.session.id)
              return null
            return await getSession(ctx.session.id) as {
              [K in keyof _ReturnType]: _ReturnType[K]
            }
          },
        }),
      },
    })
  })
