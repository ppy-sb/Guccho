import { defineNuxtPlugin, useCookie } from '#app'
import { useSession } from '~/store/session'
export default defineNuxtPlugin(async () => {
  const sessionId = useCookie<string | undefined>('session')
  const session = useSession()
  session.$onAction(({ after }) => {
    after(() => {
      if (!session.$state.sessionId) { return }
      sessionId.value = session.$state.sessionId
    })
  })
  if (session.$state.loggedIn) { return }
  if (!sessionId.value) { return }
  const result = await session.retrieve(sessionId.value)
  if (result) { return }
  sessionId.value = session.sessionId
})
