import { useSession } from '~/store/session'

export default defineNuxtPlugin(async () => {
  const sessionId = useCookie('session')
  const session = useSession()
  if (!sessionId.value) {
    return
  }
  await session.retrieve()
})
