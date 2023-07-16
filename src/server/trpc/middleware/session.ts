import { TRPCError } from '@trpc/server'
import type { H3Event } from 'h3'
import { setCookie } from 'h3'
import { UAParser } from 'ua-parser-js'
import { publicProcedure } from '../trpc'

import { unableToRefreshToken } from '../messages'
import { SessionProvider } from '$active/server'
import type { Session } from '$base/server/session'
import { Client, OS } from '~/def/device'

const sessionProvider = new SessionProvider()

// TODO finish me
function createSession(e: H3Event) {
  const ua = getRequestHeader(e, 'User-Agent')
  const r: Omit<Session<string>, 'lastSeen'> = {
    OS: OS.Unknown,
    client: Client.Unknown,
  }
  if (!ua) {
    return r
  }
  const res = UAParser(ua)

  switch (res.os.name) {
    case 'Windows': {
      r.OS = OS.Windows
      break
    }
    case 'Mac OS': {
      r.OS = OS.macOS
      break
    }
    case 'iOS': {
      r.OS = OS.iOS
      break
    }
    case 'iPadOS': {
      r.OS = OS.iPadOS
      break
    }
    case 'Chromium OS': {
      r.OS = OS.ChromeOS
      break
    }
    case 'Linux':
    case 'GNU':
    case 'Debian':
    case 'Arch':
    case 'CentOS':
    case 'Fedora':
    case 'Gentoo':
    case 'Mint':
    case 'Nintendo':
    case 'PCLinuxOS':
    case 'RedHat':
    case 'SUSE':
    case 'Tizen':
    case 'Ubuntu':
    case 'VectorLinux':
    {
      r.OS = OS.Linux
    }
  }

  if (res.browser.name) {
    r.client = Client.Browser
  }

  return r
}

const config = {
  httpOnly: true,
}

export const sessionProcedure = publicProcedure
  .use(async ({ ctx, next }) => {
    if (!ctx.session.id) {
      const sessionId = await sessionProvider.create(createSession(ctx.h3Event))
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
      const sessionId = await sessionProvider.create(createSession(ctx.h3Event))
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
