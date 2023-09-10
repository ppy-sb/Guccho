import { TRPCError } from '@trpc/server'
import { publicProcedure } from '../trpc'

import { unableToRefreshToken } from '../messages'

import { haveSession } from '~/server/middleware/0.session'
import { Constant } from '~/server/common/constants'
import { sessions } from '~/server/singleton/service'

const config = {
  httpOnly: true,
}

export const sessionProcedure = publicProcedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session.id) {
      const sessionId = await sessions.create(detectDevice(ctx.h3Event))
      setCookie(ctx.h3Event, Constant.SessionLabel, sessionId, config)
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: sessionId,
          },
        }),
      })
    }

    if (haveSession(ctx.h3Event)) {
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: ctx.session.id,
          },
        }),
      })
    }
    else {
      const session = await sessions.get(ctx.session.id)
      if (session == null) {
        const sessionId = await sessions.create(detectDevice(ctx.h3Event))
        setCookie(ctx.h3Event, Constant.SessionLabel, sessionId, config)
        return await next({
          ctx: Object.assign(ctx, {
            session: {
              id: sessionId,
            },
          }),
        })
      }
      else {
        const refreshed = await sessions.refresh(ctx.session.id)
        if (!refreshed) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: unableToRefreshToken,
          })
        }
        if (refreshed !== ctx.session.id) {
          setCookie(ctx.h3Event, Constant.SessionLabel, refreshed, config)
        }

        return await next({
          ctx: Object.assign(ctx, {
            session: {
              id: refreshed,
            },
          }),
        })
      }
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
            return (await sessions.get(ctx.session.id)) as Awaited<ReturnType<typeof sessions['get']>> & Partial<Additional>
          },
        }),
      }),
    })
  })
