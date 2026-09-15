import { useDebounceFn } from '@vueuse/core'
import useSearchablePages from './useSearchablePages'
import { Mode } from '~/def'
import type { ActiveMode } from '$active'
import type { OP, Tag } from '~/def/search'

const modes = [Mode.Osu, Mode.Taiko, Mode.Fruits, Mode.Mania]

const taggable = {
  mode: modes,
} as const

const tagOperators = {
  eq: '=',
  ne: '!=',
} as const

const compareOperators = {
  eq: '=',
  ne: '!=',
  lte: '<',
  lt: '<=',
  gte: '>=',
  gt: '>',
} as const satisfies Record<OP, string>

const queryable = {
  frozen: ['frozen', 'maps.frozen'],
  bpm: ['bpm'],
  starRating: ['star', 'sr', 'starRating'],
  circleSize: ['cs', 'circleSize'],
  approachRate: ['ar', 'approach', 'approachRate'],
  accuracy: ['od', 'accuracy', 'overallDifficulty'],
  hpDrain: ['hp', 'hpDrain'],
  length: ['length', 'time', 'len'],
} as const

const keyword = shallowRef('')
const lastKw = shallowRef('')
const tags = ref<Tag[]>([])
const beatmapPage = shallowRef(0)
const beatmapPerPage = 10
const hasMoreBeatmaps = shallowRef(false)
const includes = shallowReactive({
  beatmaps: true,
  beatmapsets: true,
  users: true,
  pages: true,
})
const searchMode = computed(() => {
  const bm = (includes.beatmaps || includes.beatmapsets)
  switch (true) {
    case (bm && !includes.users): { return 'beatmap' }
    case (includes.users && !bm): { return 'user' }
    default: { return 'all' }
  }
})

export async function useSearchResult() {
  const app = useNuxtApp()

  let cancel = new AbortController()

  const {
    data: users,
    pending: pendingUsers,
    refresh: searchUsers,
  } = await useAsyncData(async () => {
    if (!keyword.value) {
      return []
    }
    return await app.$client.user.search.query({
      keyword: keyword.value,
      limit: autoResultSize(),
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
  } = await useAsyncData(async () => {
    if (!keyword.value && !tags.value.length) {
      return []
    }
    const result = await app.$client.map.searchBeatmap.query({
      keyword: keyword.value,
      filters: tags.value,
      page: beatmapPage.value,
      perPage: beatmapPerPage + 1,
    }, {
      context: {
        skipBatch: true,
      },
      signal: cancel.signal,
    })
    hasMoreBeatmaps.value = result.length > beatmapPerPage
    return result.slice(0, beatmapPerPage)
  })

  const {
    data: beatmapsets,
    pending: pendingBeatmapsets,
    refresh: searchBeatmapsets,
  } = await useAsyncData(async () => {
    if (!keyword.value && !tags.value.length) {
      return []
    }
    return await app.$client.map.searchBeatmapset.query({
      keyword: keyword.value,
      filters: tags.value,
      limit: autoResultSize(),
    }, {
      context: {
        skipBatch: true,
      },
      signal: cancel.signal,
    })
  })

  async function loadMoreBeatmaps() {
    if (!hasMoreBeatmaps.value) {
      return
    }
    const nextPage = beatmapPage.value + 1
    const result = await app.$client.map.searchBeatmap.query({
      keyword: keyword.value,
      filters: tags.value,
      page: nextPage,
      perPage: beatmapPerPage + 1,
    }, {
      context: { skipBatch: true },
      signal: cancel.signal,
    })
    beatmapPage.value = nextPage
    hasMoreBeatmaps.value = result.length > beatmapPerPage
    beatmaps.value = [...(beatmaps.value ?? []), ...result.slice(0, beatmapPerPage)]
  }

  function raw(_extract = false) {
    _extract && extract(true)
    beatmapPage.value = 0

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
    loadMoreBeatmaps,
    hasMoreBeatmaps,
    mode: searchMode,
    keyword,
    tags,
  }
}

function tag<T extends keyof typeof taggable, K extends (typeof taggable)[T][number]>(key: T, op: keyof typeof tagOperators, value: K) {
  const t = [key, op, value] as [T, typeof op, K]
  t.toString = () => `<b>${key}</b> ${tagOperators[op]} <b>${value}</b>`
  return t
}
function query<T extends keyof typeof queryable, K>(key: T, op: keyof typeof compareOperators, value: K) {
  const t = [key, op, value] as [T, OP, K]
  t.toString = () => `<b>${key}</b> ${compareOperators[op]} <b>${value}</b>`
  return t
}

function extractTags(force: boolean) {
  // user input space to confirm tag
  if (!force && !keyword.value.endsWith(' ')) {
    return
  }

  const tokens = keyword.value.split(' ')
  keyword.value = tokens.filter((token) => {
    if (!token.includes('=')) {
      return true
    }

    for (const [op, operator] of Object.entries(tagOperators)) {
      if (!token.includes(operator)) {
        continue
      }

      const [left, right] = token.split(operator)

      if (!left || !right) {
        continue
      }
      for (const [field, keywords] of Object.entries(taggable)) {
        if (left !== field) {
          continue
        }

        if (!keywords.includes(right as unknown as ActiveMode)) {
          continue
        }
        tags.value.push(tag(field as 'mode', op as keyof typeof tagOperators, right as unknown as ActiveMode))
        return false
      }
    }
    return true
  }).join(' ')
}
function extractQueries(force: boolean, frozenOnly = false) {
  // user input space to confirm tag
  if (!force && !keyword.value.endsWith(' ')) {
    return
  }
  const tokens = keyword.value.split(' ')
  keyword.value = tokens.filter((token) => {
    let op: keyof typeof compareOperators
    for (op in compareOperators) {
      const operator = compareOperators[op]
      if (!token.includes(operator)) {
        continue
      }

      const [left, right] = token.split(operator)
      if (!left || !right) {
        continue
      }

      let field: keyof typeof queryable
      for (field in queryable) {
        if (frozenOnly && field !== 'frozen') {
          continue
        }
        const keywords: readonly string[] = queryable[field]
        if (!keywords.includes(left)) {
          continue
        }

        if (field === 'frozen') {
          if (right !== '0' && right !== '1') {
            continue
          }
          tags.value.push(['frozen', op as 'eq' | 'ne', right === '1'])
          return false
        }

        const nRight = +right
        if (Number.isNaN(nRight)) {
          continue
        }

        tags.value.push(query(field, op, nRight))
        return false
      }
    }
    return true
  }).join(' ')
}

function extract(force = false) {
  extractQueries(force, searchMode.value !== 'beatmap')
  if (searchMode.value === 'beatmap') {
    extractTags(force)
  }
}
function autoResultSize() {
  return searchMode.value === 'all' ? 5 : 10
}
