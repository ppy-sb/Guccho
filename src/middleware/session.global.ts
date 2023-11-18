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
    session.$reset()
  }
})
