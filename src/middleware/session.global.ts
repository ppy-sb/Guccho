import { useCookie } from '#app'
import { useSession } from '~/store/session'

export default defineNuxtRouteMiddleware(async () => {
  const sessionId = useCookie <string | undefined>('session')
  const session = useSession()
  if (!sessionId.value)
    return
  await session.retrieve()
})
