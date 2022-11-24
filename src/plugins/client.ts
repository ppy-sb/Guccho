import { httpBatchLink, createTRPCProxyClient } from '@trpc/client'
import type { AppRouter } from '@/server/trpc/routers'

(BigInt.prototype as any).toJSON = function () {
  return Number(this)
}
export default defineNuxtPlugin(() => {
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         **/
        url: 'http://localhost:3000/api/trpc'
      })
    ]
  })
  return {
    provide: {
      client
    }
  }
})
