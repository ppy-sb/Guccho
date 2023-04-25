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
        url: '/api/trpc',
        maxURLLength: 2083, // a suitable size
      }),
    ],
  })
  return {
    provide: {
      client,
    },
  }
})
