import { createTRPCNuxtClient, httpBatchLink, httpLink } from 'trpc-nuxt/client'
import { splitLink } from '@trpc/client'
import { transformer } from '~/server/trpc/transformer'
import type { AppRouter } from '~/server/trpc/routers'

const url = '/api/trpc'
export default defineNuxtPlugin(() => {
  const client = createTRPCNuxtClient<AppRouter>({
    transformer,
    links: [
      splitLink({
        // check for context property `skipBatch`
        condition: (op) => {
          return op.context.skipBatch === true
        },
        // when condition is true, use normal request
        true: httpLink({ url }),
        // when condition is false, use batching
        false: httpBatchLink({
          url,
          /** @link https://github.com/trpc/trpc/issues/2008 */
          // maxBatchSize: 7
        }),
      }),
    ],
  })
  return {
    provide: {
      client,
    },
  }
})
