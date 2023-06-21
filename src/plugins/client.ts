import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'
import { transformer } from '~/server/trpc/transformer'
import type { AppRouter } from '~/server/trpc/routers'

export default defineNuxtPlugin(() => {
  const client = createTRPCNuxtClient<AppRouter>({
    transformer,
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
