import { useCookie } from '#app'
import { useSession } from '~/store/session'

export default defineNuxtRouteMiddleware(async () => {
  const sessionId = useCookie<string | undefined>('session')
  const session = useSession()
  if (!sessionId.value) {
    return
  }
  if (session.loggedIn) {
    return
  }
  try {
    await session.retrieve()
  }
  catch (error) {
    // server restarted probably, will have to re-login again
    session.$reset()
  }
})
