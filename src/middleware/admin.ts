import { useSession } from '~/store/session'

export default defineNuxtRouteMiddleware(() => {
  const { $state } = useSession()
  if (!$state.privilege.staff) {
    const returnValue = {
      name: 'article-id',
      param: {
        slug: '403',
      },
    }

    return returnValue
  }
})
