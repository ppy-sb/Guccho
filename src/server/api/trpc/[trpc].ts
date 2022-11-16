import { createNuxtApiHandler } from 'trpc-nuxt'
import { appRouter } from '@/server/trpc/routers'
import { createContext } from '@/server/trpc/context'
// export API handler
export default createNuxtApiHandler({
  router: appRouter,
  // TODO: figure out what to return, parameters error
  // @ts-expect-error it works
  createContext
})
