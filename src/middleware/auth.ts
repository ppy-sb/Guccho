import { useSession } from '~/store/session'

export default defineNuxtRouteMiddleware((to, from) => {
  const { $state } = useSession()
  if (!$state.userId && to.name !== 'auth-login') {
    const returnValue = {
      name: 'auth-login',
      query: {
        redirect: to.fullPath,
      },
    }

    return returnValue
  }
})
