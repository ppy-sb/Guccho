import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@/server/trpc/routers'

export default defineNuxtPlugin(() => {
  const session = useCookie('session')
  const client = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         **/
        url: 'http://localhost:3000/api/trpc',
        fetch(url, options) {
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers || {},
              cookie: (options?.headers as Record<string, string>)?.cookie || `session=${session.value}`,
            },
            credentials: 'include',
          })
        },
      }),
    ],
  })
  return {
    provide: {
      client,
    },
  }
})
