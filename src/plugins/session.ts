import { defineNuxtPlugin, useCookie } from '#app'
import { useSession } from '~/store/session'
export default defineNuxtPlugin(async () => {
  // for now it's just handle$md5(password)
  const sessionId = useCookie('session')
  const session = useSession()
  session.$onAction(({ after }) => {
    after(() => {
      if (!session.$state.loggedIn) { return }
      if (!session.$state.md5HashedPassword) { return }
      sessionId.value = `${session.$state.userId}$${session.$state.md5HashedPassword}`
    })
  })
  if (session.$state.loggedIn) { return }
  if (!sessionId.value) { return }
  // TODO: implement session
  const [handle, ..._password] = sessionId.value.split('$')
  const password = _password.join('$')
  console.log(handle, password)
  const result = await session.loginHashed(handle, password)
  if (result) { return }
  sessionId.value = ''
})
