import { useDebounceFn } from '@vueuse/core'
import useSearchablePages from './useSearchablePages'
import { modes } from '~/def'
import type { ActiveMode } from '~/def/common'
import type { OP, Tag } from '~/def/search'

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
const includes = shallowReactive({
  beatmaps: true,
  beatmapsets: true,
  users: true,
})
const searchMode = computed(() => ((includes.beatmaps || includes.beatmapsets) && !includes.users) ? 'beatmap' : 'all')

export async function useSearchResult() {
  const app = useNuxtApp()

  const {
    data: users,
    pending: pendingUsers,
    refresh: searchUsers,
  } = await useAsyncData(async () => {
    if (!keyword.value) {
      return []
    }
    return await app.$client.search.searchUser.query({
      keyword: keyword.value,
      limit: autoResultSize(),
    }, {
      context: {
        skipBatch: true,
      },
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
    return await app.$client.search.searchBeatmap.query({
      keyword: keyword.value,
      filters: tags.value,
      limit: autoResultSize(),
    }, {
      context: {
        skipBatch: true,
      },
    })
  })

  const {
    data: beatmapsets,
    pending: pendingBeatmapsets,
    refresh: searchBeatmapsets,
  } = await useAsyncData(async () => {
    if (!keyword.value && !tags.value.length) {
      return []
    }
    return await app.$client.search.searchBeatmapset.query({
      keyword: keyword.value,
      filters: tags.value,
      limit: autoResultSize(),
    }, {
      context: {
        skipBatch: true,
      },
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

    includes.users ? searchUsers() : users.value = []
    includes.beatmaps ? searchBeatmaps() : beatmaps.value = []
    includes.beatmapsets ? searchBeatmapsets() : beatmapsets.value = []
  }

  const search = useDebounceFn(raw, 500)

  watch(tags, raw.bind(null, undefined), { deep: true })

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
function extractQueries(force: boolean) {
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
        const keywords: readonly string[] = queryable[field]
        if (!keywords.includes(left)) {
          continue
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
  if (searchMode.value === 'beatmap') {
    extractTags(force)
    extractQueries(force)
  }
}
function autoResultSize() {
  return searchMode.value === 'all' ? 5 : 10
}
