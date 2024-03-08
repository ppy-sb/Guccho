import { GucchoError } from '../messages'
import { publicProcedure } from '../trpc'
import { Constant } from '~/server/common/constants'
import { haveSession } from '~/server/middleware/0.session'
import { sessions } from '~/server/singleton/service'
import { type Session } from '$base/server/session'

const config = {
  httpOnly: true,
}
export const sessionProcedure = publicProcedure
  .use(async ({ ctx, next }) => {
    const opt = {
      ...config,
      maxAge: ctx.session.persist ? Constant.PersistDuration as number : undefined,
    }
    if (!ctx.session.id) {
      const sessionId = await sessions.create(detectDevice(ctx.h3Event))
      setCookie(ctx.h3Event, Constant.SessionLabel, sessionId, opt)
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: sessionId,
            persist: ctx.session.persist,
          },
        }),
      })
    }

    if (haveSession(ctx.h3Event)) {
      return await next({
        ctx: Object.assign(ctx, {
          session: {
            id: ctx.session.id,
            persist: ctx.session.persist,
          },
        }),
      })
    }
    else {
      const session = await sessions.get(ctx.session.id)
      if (session == null) {
        const sessionId = await sessions.create(detectDevice(ctx.h3Event))
        setCookie(ctx.h3Event, Constant.SessionLabel, sessionId, opt)
        return await next({
          ctx: Object.assign(ctx, {
            session: {
              id: sessionId,
              persist: ctx.session.persist,
            },
          }),
        })
      }
      else {
        const refreshed = await sessions.refresh(ctx.session.id)
        if (!refreshed) {
          throwGucchoError(GucchoError.UnableToRefreshToken)
        }

        setCookie(ctx.h3Event, Constant.SessionLabel, refreshed, opt)

        const persist = ctx.session.persist
        if (persist) {
          setCookie(ctx.h3Event, Constant.Persist, 'yes', opt)
        }

        return await next({
          ctx: Object.assign(ctx, {
            session: {
              id: refreshed,
              persist,
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
          async getBinding() {
            if (!ctx.session.id) {
              return undefined
            }
            return (await sessions.get(ctx.session.id)) as Awaited<ReturnType<typeof sessions['get']>>
          },
          update: (data: Partial<Session>) => sessions.update(ctx.session.id, data),
        }),
      }),
    })
  })
