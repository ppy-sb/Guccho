import { useDebounceFn } from '@vueuse/core'
import useSearchablePages from './useSearchablePages'
import { createSearchState } from './useSearchShared'

const MODAL_BEATMAP_LIMIT = 10

export async function useSearchModal() {
  const app = useNuxtApp()

  const { keyword, tags, includes, searchMode, extract } = createSearchState()
  const lastKw = shallowRef('')

  let cancel = new AbortController()

  function modalResultSize() {
    return searchMode.value === 'all' ? 5 : 10
  }

  const {
    data: users,
    pending: pendingUsers,
    refresh: searchUsers,
  } = await useAsyncData('searchModal:users', async () => {
    if (!keyword.value) {
      return []
    }
    return await app.$client.user.search.query({
      keyword: keyword.value,
      limit: modalResultSize(),
    }, {
      context: {
        skipBatch: true,
      },
      signal: cancel.signal,
    })
  })

  const {
    data: beatmaps,
    pending: pendingBeatmaps,
    refresh: searchBeatmaps,
  } = await useAsyncData('searchModal:beatmaps', async () => {
    if (!keyword.value && !tags.value.length) {
      return []
    }
    return await app.$client.map.searchBeatmap.query({
      keyword: keyword.value,
      filters: tags.value,
      page: 0,
      perPage: MODAL_BEATMAP_LIMIT,
    }, {
      context: {
        skipBatch: true,
      },
      signal: cancel.signal,
    })
  })

  const {
    data: beatmapsets,
    pending: pendingBeatmapsets,
    refresh: searchBeatmapsets,
  } = await useAsyncData('searchModal:beatmapsets', async () => {
    if (!keyword.value && !tags.value.length) {
      return []
    }
    return await app.$client.map.searchBeatmapset.query({
      keyword: keyword.value,
      filters: tags.value,
      limit: modalResultSize(),
    }, {
      context: {
        skipBatch: true,
      },
      signal: cancel.signal,
    })
  })

  function raw(_extract = false) {
    _extract && extract(true)

    if (tags.value.length < 1) {
      if (!keyword.value) {
        beatmaps.value = []
        beatmapsets.value = []
        users.value = []
      }
      if (keyword.value === lastKw.value) {
        return
      }
    }
    if (cancel) {
      cancel.abort()
    }
    cancel = new AbortController()

    includes.users ? searchUsers() : (users.value = [])
    includes.beatmaps ? searchBeatmaps() : (beatmaps.value = [])
    includes.beatmapsets ? searchBeatmapsets() : (beatmapsets.value = [])
  }

  const search = useDebounceFn(raw, 500)

  const searchablePages = useSearchablePages()

  const pages = computed(() => searchablePages.search(keyword.value))

  return {
    loading: reactive({
      users: pendingUsers,
      beatmaps: pendingBeatmaps,
      beatmapsets: pendingBeatmapsets,
    }),
    results: {
      users,
      beatmaps,
      beatmapsets,
      pages,
    },
    nothing: computed(() => {
      return (keyword.value || tags.value.length) && (
        !pendingUsers.value
        && !pendingBeatmaps.value
        && !pendingBeatmapsets.value
      ) && (
        !beatmapsets?.value?.length
        && !beatmaps?.value?.length
        && !users?.value?.length
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
  }
}
