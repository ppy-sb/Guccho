import { Mode } from '~/def'
import type { ActiveMode } from '$active'
import type { OP, Tag } from '~/def/search'

// ============================================================================
// Shared search utilities
// ============================================================================

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

function extractTags(keyword: Ref<string>, tags: Ref<Tag[]>, force: boolean) {
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

function extractQueries(keyword: Ref<string>, tags: Ref<Tag[]>, force: boolean, frozenOnly = false) {
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

export function createSearchState() {
  const keyword = shallowRef('')
  const tags = ref<Tag[]>([])
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

  function extract(force = false) {
    extractQueries(keyword, tags, force, searchMode.value !== 'beatmap')
    if (searchMode.value === 'beatmap') {
      extractTags(keyword, tags, force)
    }
  }

  return {
    keyword,
    tags,
    includes,
    searchMode,
    extract,
  }
}
