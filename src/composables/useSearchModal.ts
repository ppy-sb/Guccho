import { useDebounceFn } from '@vueuse/core'
import { modes } from '~/types/defs'
import type { Mode } from '~/types/common'
import type { OP, Tag } from '~/types/search'

const taggable = {
  mode: modes,
}
const tagOperators = {
  eq: '=',
  ne: '!=',
}
const compareOperators: Record<OP, string> = {
  eq: '=',
  ne: '!=',
  lte: '<',
  lt: '<=',
  gte: '>=',
  gt: '>',
}
const queryable = {
  bpm: ['bpm'],
  starRating: ['star', 'sr', 'starRating'],
  circleSize: ['cs', 'circleSize'],
  approachRate: ['ar', 'approach', 'approachRate'],
  accuracy: ['od', 'accuracy', 'overallDifficulty'],
  hpDrain: ['hp', 'hpDrain'],
  length: ['length', 'time', 'len'],
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

export default async function () {
  const app = useNuxtApp()

  const keyword = shallowRef('')
  const lastKw = shallowRef('')
  const tags = ref<Tag[]>([])
  const includes = reactive({
    beatmaps: true,
    beatmapsets: true,
    users: true,
  })
  const mode = computed(() => ((includes.beatmaps || includes.beatmapsets) && !includes.users) ? 'beatmap' : 'all')

  const auto = computed(() => mode.value === 'all' ? 5 : 10)

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
      limit: auto.value,
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
      limit: auto.value,
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
      limit: auto.value,
    })
  })

  const extractTags = (force: boolean) => {
    // user input space to confirm tag
    if (!force && !keyword.value.endsWith(' ')) {
      return
    }

    const tokens = keyword.value.split(' ')
    keyword.value = tokens.filter((token) => {
      if (!token.includes('=')) {
        return true
      }

      let op: keyof typeof tagOperators
      for (op in tagOperators) {
        const operator = tagOperators[op]
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
        let field: keyof typeof taggable
        for (field in taggable) {
          if (left !== field) {
            continue
          }

          const keywords = taggable[field]
          if (!keywords.includes(right as Mode)) {
            continue
          }
          tags.value.push(tag(field, op, right as Mode))
          return false
        }
      }
      return true
    }).join(' ')
  }
  const extractQueries = (force: boolean) => {
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
          const keywords = queryable[field]
          if (!keywords.includes(left)) {
            continue
          }
          const nRight = +right
          if (isNaN(nRight)) {
            continue
          }
          tags.value.push(query(field, op, nRight))
          return false
        }
      }
      return true
    }).join(' ')
  }

  const extract = (force = false) => {
    if (mode.value === 'beatmap') {
      extractTags(force)
      extractQueries(force)
    }
  }

  const raw = (_extract = false) => {
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

  watch(tags, () => raw(), { deep: true })

  const loading = reactive({
    users: pendingUsers,
    beatmaps: pendingBeatmaps,
    beatmapsets: pendingBeatmapsets,
  })

  return {
    loading,
    results: {
      users,
      beatmaps,
      beatmapsets,
    },
    nothing: computed(() => {
      const nothingBS = Array.isArray(beatmapsets.value) ? !beatmapsets.value.length : true
      const nothingBM = Array.isArray(beatmaps.value) ? beatmaps.value.length : true
      const nothingUser = Array.isArray(users.value) ? !users.value.length : true
      return nothingBS && nothingBM && nothingUser
    }),

    includes,
    onInput() {
      extract()
      search(false)
    },
    raw,
    mode,
    keyword,
    tags,
  }
}
