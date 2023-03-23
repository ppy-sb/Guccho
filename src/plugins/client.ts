import superjson from 'superjson'
import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'
import type { AppRouter } from '@/server/trpc/routers'

export default defineNuxtPlugin(() => {
  const client = createTRPCNuxtClient<AppRouter>({
    transformer: superjson,
    links: [
      httpLink({
        url: '/api/trpc',
      }),
      httpBatchLink({
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         **/
        url: '/api/trpc',
        maxURLLength: 2083, // a suitable size
        // fetch(url, options) {
        //   return fetch(url, {
        //     ...options,
        //     headers: {
        //       ...options?.headers || {},
        //       cookie: (options?.headers as Record<string, string>)?.cookie || `session=${session.value}`,
        //     },
        //     credentials: 'include',
        //   })
        // },
      }),
    ],
  })
  return {
    provide: {
      client,
    },
  }
})
