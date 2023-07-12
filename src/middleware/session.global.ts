import { useSession } from '~/store/session'

export default defineNuxtRouteMiddleware(async () => {
  const session = useSession()
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
