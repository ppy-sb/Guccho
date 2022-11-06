import { defineNuxtPlugin, useCookie } from '#app'
import { useSession } from '~/store/session'
export default defineNuxtPlugin(async () => {
  const sessionId = useCookie<string | undefined>('session')
  console.log('sessionId in cookie:', sessionId.value)
  const session = useSession()
  if (!sessionId.value) { return }
  await session.retrieve()
})
