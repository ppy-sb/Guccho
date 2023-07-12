import { useSession } from '~/store/session'

export default defineNuxtPlugin(async () => {
  const session = useSession()
  await session.retrieve()
})
