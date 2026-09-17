import { useDebounceFn } from '@vueuse/core'
import { createSearchState } from './useSearchShared'

export async function useSearchPage() {
  const app = useNuxtApp()

  const { keyword, tags, includes, searchMode, extract } = createSearchState()

  let cancel = new AbortController()

  const {
    data: users,
    pending: pendingUsers,
    refresh: searchUsers,
  } = await useAsyncData('searchPage:users', async () => {
    if (!keyword.value) {
      return []
    }
    const limit = searchMode.value === 'all' ? 10 : 20
    return await app.$client.user.search.query({
      keyword: keyword.value,
      limit,
    }, {
      context: {
        skipBatch: true,
      },
      signal: cancel.signal,
    })
  })

  function raw(_extract = false) {
    _extract && extract(true)

    if (tags.value.length < 1 && !keyword.value) {
      users.value = []
      return
    }

    if (cancel) {
      cancel.abort()
    }
    cancel = new AbortController()

    includes.users ? searchUsers() : (users.value = [])
  }

  const search = useDebounceFn(raw, 500)

  return {
    loading: reactive({
      users: pendingUsers,
    }),
    results: {
      users,
    },
    nothing: computed(() => {
      return (keyword.value || tags.value.length) && (
        !pendingUsers.value
      ) && (
        !users?.value?.length
      )
    }),

    includes,
    onInput() {
      extract()
      search(false)
    },
    raw,
    mode: searchMode,
    keyword,
    tags,
    extract,
  }
}
