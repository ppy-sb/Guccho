import { useSession } from '~/store/session'

export default defineNuxtPlugin(async () => {
  const session = useSession()
  if (session.loggedIn) {
    return
  }
  await session.retrieve()
})
