<i18n lang="yaml">
en-GB:
  title: Search
  placeholder: Search
  all: All
  mapset-only: Mapsets only
  beatmapsets: Beatmapsets
  beatmaps: Beatmaps
  users: Users
  custom-ranked: Custom ranked maps only
  map-filters: Map filters
  mode: Mode
  all-modes: All modes
  cs: CS
  ar: AR
  od: OD
  length: Length
  apply: Apply filters
  beatmap-search: Beatmaps
  user-search: Users
  status: Status
  mapper: Mapper
  star: Stars
  any: Any
  search-action: Search
  load-more: Load more
  advanced: Advanced search
  advanced-locked: Supporter feature
  key: Key
  nothing: No results found.
  searching: Searching...

zh-CN:
  title: 搜索
  placeholder: 搜索
  all: 全部
  mapset-only: 仅图组
  beatmapsets: 图组
  beatmaps: 谱面
  users: 用户
  custom-ranked: 仅显示自定义 Ranked 谱面
  map-filters: 谱面筛选
  mode: 模式
  all-modes: 所有模式
  cs: CS
  ar: AR
  od: OD
  length: 长度
  apply: 应用筛选
  beatmap-search: 谱面
  user-search: 用户
  status: 状态
  mapper: 谱师
  star: 星数
  any: 任意
  search-action: 搜索
  load-more: 加载更多
  advanced: 高级搜索
  advanced-locked: 支持者专属功能
  key: 键数
  nothing: 没有找到结果。
  searching: 搜索中...

fr-FR:
  title: Rechercher
  placeholder: Rechercher
  all: Tout
  mapset-only: Beatmapsets uniquement
  beatmapsets: Beatmapsets
  beatmaps: Beatmaps
  users: Utilisateurs
  custom-ranked: Beatmaps ranked personnalisées
  map-filters: Filtres de beatmaps
  mode: Mode
  all-modes: Tous les modes
  cs: CS
  ar: AR
  od: OD
  length: Durée
  apply: Appliquer les filtres
  beatmap-search: Beatmaps
  user-search: Utilisateurs
  status: Statut
  mapper: Mapper
  star: Étoiles
  any: Tous
  search-action: Rechercher
  load-more: Charger plus
  advanced: Avancé
  advanced-locked: Fonction réservée aux supporters
  key: Touches
  nothing: Aucun résultat.
  searching: Recherche...

de-DE:
  title: Suche
  placeholder: Suchen
  all: Alle
  mapset-only: Nur Beatmapsets
  beatmapsets: Beatmapsets
  beatmaps: Beatmaps
  users: Benutzer
  custom-ranked: Benutzerdefinierte Ranked-Maps
  map-filters: Beatmap-Filter
  mode: Modus
  all-modes: Alle Modi
  cs: CS
  ar: AR
  od: OD
  length: Länge
  apply: Filter anwenden
  beatmap-search: Beatmaps
  user-search: Benutzer
  status: Status
  mapper: Mapper
  star: Sterne
  any: Beliebig
  search-action: Suchen
  load-more: Mehr laden
  advanced: Erweitert
  advanced-locked: Unterstützer-Funktion
  key: Tasten
  nothing: Keine Ergebnisse gefunden.
  searching: Suche...
</i18n>

<script setup lang="ts">
import { Mode } from '~/def'
import { RankingStatus } from '~/def/beatmap'
import type { Tag } from '~/def/search'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const app = useNuxtApp()

useHead({
  title: () => t('title'),
})

const {
  includes,
  raw,
  keyword,
  tags,
  extract,
  results: { users },
  loading,
  nothing,
} = await useSearchPage()
const { data: advancedSearchAllowed } = await app.$client.map.canUseAdvancedSearch.useQuery()

const searchTarget = ref<'beatmaps' | 'users'>(route.query.target === 'users' ? 'users' : 'beatmaps')
const hasSearched = ref(Boolean(route.query.q))
const mapFilters = reactive({
  mode: '' as Mode | '',
  csEq: '',
  csMin: '',
  csMax: '',
  csMinOp: 'gte' as 'gte' | 'gt',
  csMaxOp: 'lte' as 'lte' | 'lt',
  arEq: '',
  arMin: '',
  arMax: '',
  arMinOp: 'gte' as 'gte' | 'gt',
  arMaxOp: 'lte' as 'lte' | 'lt',
  odEq: '',
  odMin: '',
  odMax: '',
  odMinOp: 'gte' as 'gte' | 'gt',
  odMaxOp: 'lte' as 'lte' | 'lt',
  starEq: '',
  starMin: '',
  starMax: '',
  starMinOp: 'gte' as 'gte' | 'gt',
  starMaxOp: 'lte' as 'lte' | 'lt',
  lengthEnabled: false,
  lengthMin: 0,
  lengthMax: 600,

  advanced: false,
})
const customRanked = ref(false)
const mapsetOnly = ref(true)

// Restore state from URL
function restoreFromUrl() {
  if (route.query.rank === 'custom') {
    customRanked.value = true
  }
  if (route.query.maps === 'set-only') {
    mapsetOnly.value = true
  }
  else if (route.query.maps === 'grouped') {
    mapsetOnly.value = false
  }

  if (typeof route.query.mode === 'string' && route.query.mode in Mode) {
    mapFilters.mode = route.query.mode as Mode
  }

  const numericFilters: Array<['cs' | 'ar' | 'od' | 'star', string]> = [
    ['cs', 'cs'], ['ar', 'ar'], ['od', 'od'], ['star', 'star'],
  ]
  for (const [key, paramKey] of numericFilters) {
    if (route.query[`${paramKey}-eq`]) {
      (mapFilters as any)[`${key}Eq`] = route.query[`${paramKey}-eq`]
    }
    if (route.query[`${paramKey}-min`]) {
      (mapFilters as any)[`${key}Min`] = route.query[`${paramKey}-min`]
    }
    if (route.query[`${paramKey}-min-op`] && (route.query[`${paramKey}-min-op`] === 'gte' || route.query[`${paramKey}-min-op`] === 'gt')) {
      (mapFilters as any)[`${key}MinOp`] = route.query[`${paramKey}-min-op`]
    }
    if (route.query[`${paramKey}-max`]) {
      (mapFilters as any)[`${key}Max`] = route.query[`${paramKey}-max`]
    }
    if (route.query[`${paramKey}-max-op`] && (route.query[`${paramKey}-max-op`] === 'lte' || route.query[`${paramKey}-max-op`] === 'lt')) {
      (mapFilters as any)[`${key}MaxOp`] = route.query[`${paramKey}-max-op`]
    }
  }

  if (route.query['length-enabled'] === '1') {
    mapFilters.lengthEnabled = true
    if (route.query['length-min']) {
      mapFilters.lengthMin = Number(route.query['length-min'])
    }
    if (route.query['length-max']) {
      mapFilters.lengthMax = Number(route.query['length-max'])
    }
  }

  // Set advanced to true if any advanced filters are present
  const hasAdvancedFilters = numericFilters.some(([key]) =>
    mapFilters[`${key}Eq` as keyof typeof mapFilters]
    || mapFilters[`${key}Min` as keyof typeof mapFilters]
    || mapFilters[`${key}Max` as keyof typeof mapFilters],
  ) || mapFilters.lengthEnabled
  if (hasAdvancedFilters) {
    mapFilters.advanced = true
  }
}

restoreFromUrl()
const groupedBeatmapsets = ref<any[]>([])
const groupedLoading = ref(false)
const groupedPage = ref(0)
const groupedHasMore = ref(false)
let groupedSearchAbort = new AbortController()
let groupedSearchRequest = 0
const groupedNothing = computed(() => Boolean(
  hasSearched.value
  && !groupedLoading.value
  && !groupedBeatmapsets.value.length,
))

function cancelGroupedSearch() {
  groupedSearchRequest++
  groupedSearchAbort.abort()
  groupedSearchAbort = new AbortController()
  groupedLoading.value = false
}

async function searchGroupedBeatmapsets() {
  cancelGroupedSearch()
  const request = groupedSearchRequest
  const signal = groupedSearchAbort.signal
  const mapsetOnlySearch = mapsetOnly.value
  const pageSize = mapsetOnlySearch ? 50 : 20
  groupedLoading.value = true
  groupedPage.value = 0
  try {
    const result = await app.$client.map.searchBeatmapsetGrouped.query({
      keyword: keyword.value,
      filters: tags.value,
      mapsetOnly: mapsetOnlySearch,
      limit: pageSize + 1,
      offset: 0,
    }, {
      context: { skipBatch: true },
      signal,
    })
    if (request !== groupedSearchRequest) {
      return
    }
    groupedHasMore.value = result.length > pageSize
    groupedBeatmapsets.value = result.slice(0, pageSize)
  }
  catch (error) {
    if (!signal.aborted) {
      throw error
    }
  }
  finally {
    if (request === groupedSearchRequest) {
      groupedLoading.value = false
    }
  }
}

async function loadMoreGroupedBeatmapsets() {
  if (groupedLoading.value || !groupedHasMore.value) {
    return
  }
  const request = groupedSearchRequest
  const signal = groupedSearchAbort.signal
  const mapsetOnlySearch = mapsetOnly.value
  const pageSize = mapsetOnlySearch ? 50 : 20
  groupedLoading.value = true
  try {
    const result = await app.$client.map.searchBeatmapsetGrouped.query({
      keyword: keyword.value,
      filters: tags.value,
      mapsetOnly: mapsetOnlySearch,
      limit: pageSize + 1,
      offset: (groupedPage.value + 1) * pageSize,
    }, {
      context: { skipBatch: true },
      signal,
    })
    if (request !== groupedSearchRequest) {
      return
    }
    groupedPage.value++
    groupedHasMore.value = result.length > pageSize
    groupedBeatmapsets.value.push(...result.slice(0, pageSize))
  }
  catch (error) {
    if (!signal.aborted) {
      throw error
    }
  }
  finally {
    if (request === groupedSearchRequest) {
      groupedLoading.value = false
    }
  }
}

function setTarget(target: typeof searchTarget.value) {
  if (target !== searchTarget.value) {
    hasSearched.value = false
    cancelGroupedSearch()
    searchTarget.value = target
  }
  includes.beatmapsets = target === 'beatmaps'
  includes.beatmaps = target === 'beatmaps'
  includes.users = target === 'users'
  includes.pages = false
}

function updateMapsetOnly() {
  if (hasSearched.value) {
    searchGroupedBeatmapsets()
  }
}

function formatLength(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function statusName(beatmap: { status?: RankingStatus }) {
  if (beatmap.status === undefined) {
    return RankingStatus.Unknown
  }
  return typeof beatmap.status === 'number' ? RankingStatus[beatmap.status] : beatmap.status
}

function submit() {
  syncMapFilters()
  hasSearched.value = true
  if (searchTarget.value === 'beatmaps') {
    searchGroupedBeatmapsets()
  }
  else {
    raw(true)
  }

  // Build query params from all state
  const query: Record<string, string> = {
    target: searchTarget.value,
  }

  if (keyword.value) {
    query.q = keyword.value
  }

  if (searchTarget.value === 'beatmaps') {
    if (customRanked.value) {
      query.rank = 'custom'
    }
    if (mapsetOnly.value) {
      query.maps = 'set-only'
    }
    else {
      query.maps = 'grouped'
    }
    if (mapFilters.mode) {
      query.mode = mapFilters.mode
    }

    // Numeric filters
    const numericFilters: Array<['cs' | 'ar' | 'od' | 'star', string]> = [
      ['cs', 'cs'], ['ar', 'ar'], ['od', 'od'], ['star', 'star'],
    ]
    for (const [key, paramKey] of numericFilters) {
      if (mapFilters[`${key}Eq` as keyof typeof mapFilters]) {
        query[`${paramKey}-eq`] = String(mapFilters[`${key}Eq` as keyof typeof mapFilters])
      }
      if (mapFilters[`${key}Min` as keyof typeof mapFilters]) {
        query[`${paramKey}-min`] = String(mapFilters[`${key}Min` as keyof typeof mapFilters])
        query[`${paramKey}-min-op`] = mapFilters[`${key}MinOp` as keyof typeof mapFilters] as string
      }
      if (mapFilters[`${key}Max` as keyof typeof mapFilters]) {
        query[`${paramKey}-max`] = String(mapFilters[`${key}Max` as keyof typeof mapFilters])
        query[`${paramKey}-max-op`] = mapFilters[`${key}MaxOp` as keyof typeof mapFilters] as string
      }
    }

    if (mapFilters.lengthEnabled) {
      query['length-enabled'] = '1'
      query['length-min'] = String(mapFilters.lengthMin)
      query['length-max'] = String(mapFilters.lengthMax)
    }
  }

  router.replace({ query })
}

function toggleCustomRanked() {
  customRanked.value = !customRanked.value
}

function syncMapFilters() {
  const next: Tag[] = []
  if (customRanked.value) {
    next.push(['frozen', 'eq', true])
  }
  if (mapFilters.mode) {
    next.push(['mode', 'eq', mapFilters.mode])
  }
  const numericFilters: Array<['cs' | 'ar' | 'od' | 'star', Tag[0]]> = [
    ['cs', 'circleSize'], ['ar', 'approachRate'], ['od', 'accuracy'], ['star', 'starRating'],
  ]
  for (const [key, field] of numericFilters) {
    for (const [suffix, op] of [['Eq', 'eq'], ['Min', mapFilters[`${key}MinOp` as keyof typeof mapFilters]], ['Max', mapFilters[`${key}MaxOp` as keyof typeof mapFilters]]] as const) {
      const value = Number(mapFilters[`${key}${suffix}` as keyof typeof mapFilters])
      if (mapFilters[`${key}${suffix}` as keyof typeof mapFilters] && Number.isFinite(value)) {
        if (field === 'circleSize' && mapFilters.mode === Mode.Mania && suffix === 'Eq') {
          next.push(value === 3 ? ['circleSize', 'lt', 4] : value === 8 ? ['circleSize', 'gt', 7] : ['circleSize', 'eq', value])
        }
        else {
          next.push([field, op, value] as Tag)
        }
      }
    }
  }
  if (mapFilters.lengthEnabled) {
    if (mapFilters.lengthMin > 0) {
      next.push(['length', 'gte', mapFilters.lengthMin])
    }
    if (mapFilters.lengthMax < 600) {
      next.push(['length', 'lte', mapFilters.lengthMax])
    }
  }
  tags.value = next
}

function setPreset(field: 'cs' | 'ar' | 'od' | 'star', value = '') {
  clearProperty(field)
  ; (mapFilters as unknown as Record<string, string>)[`${field}Eq`] = value
}

function clearProperty(field: 'cs' | 'ar' | 'od' | 'star') {
  for (const suffix of ['Eq', 'Min', 'Max'] as const) {
    (mapFilters as unknown as Record<string, string>)[`${field}${suffix}`] = ''
  }
}

watch(() => route.query.q, (query) => {
  const next = typeof query === 'string' ? query : ''
  if (next === keyword.value) {
    return
  }
  keyword.value = next
  if (next) {
    hasSearched.value = true
  }
}, { immediate: true })

watch(() => route.query.target, (target) => {
  setTarget(target === 'users' ? 'users' : 'beatmaps')
  if (typeof route.query.q === 'string' && route.query.q) {
    hasSearched.value = true
  }
}, { immediate: true })

onBeforeUnmount(cancelGroupedSearch)

// const lengthMinPercent = computed(() => `${(mapFilters.lengthMin / 600) * 100}%`)
// const lengthMaxPercent = computed(() => `${(mapFilters.lengthMax / 600) * 100}%`)

// function updateLengthMin() {
//   mapFilters.lengthMin = Math.min(mapFilters.lengthMin, mapFilters.lengthMax)
// }

// function updateLengthMax() {
//   mapFilters.lengthMax = Math.max(mapFilters.lengthMax, mapFilters.lengthMin)
// }

setTarget(searchTarget.value)
if (hasSearched.value) {
  syncMapFilters()
  if (searchTarget.value === 'beatmaps') {
    searchGroupedBeatmapsets()
  }
  else {
    raw(true)
  }
}
</script>

<template>
  <main class="container mx-auto custom-container search-page">
    <section class="search-intro">
      <form @submit.prevent="submit">
        <label class="sr-only" for="search-keyword">{{ t('title') }}</label>
        <div class="search-target" role="tablist">
          <button
            type="button" class="target-option" :class="{ 'target-option-active': searchTarget === 'beatmaps' }"
            @click="setTarget('beatmaps')"
          >
            <icon name="ion:musical-notes-outline" class="w-4 h-4" />
            {{ t('beatmap-search') }}
          </button>
          <button
            type="button" class="target-option" :class="{ 'target-option-active': searchTarget === 'users' }"
            @click="setTarget('users')"
          >
            <icon name="ion:people-outline" class="w-4 h-4" />
            {{ t('user-search') }}
          </button>
        </div>
        <label class="input input-bordered search-field mt-4">
          <icon name="ion:search-outline" class="w-6 h-6 shrink-0" />
          <input
            id="search-keyword" v-model="keyword" type="text" :placeholder="t('placeholder')" autocomplete="off"
            autofocus
            @input="hasSearched = false"
          >
          <button
            v-if="keyword" type="button" class="icon-button" aria-label="Clear search"
            @click="keyword = ''; hasSearched = false"
          >
            <icon name="ion:close-outline" class="w-5 h-5" />
          </button>
        </label>
        <div v-if="searchTarget === 'beatmaps'" class="search-filters" aria-label="Map filters">
          <span class="filter-heading">{{ t('map-filters') }}</span>
          <div class="preset-row">
            <button type="button" class="preset-label preset-active" @click="mapFilters.mode = ''">
              {{ t('mode') }}
            </button>
            <button
              type="button" class="preset-option" :class="{ 'preset-option-active': !mapFilters.mode }"
              @click="mapFilters.mode = ''"
            >
              {{ t('all-modes') }}
            </button>
            <button
              v-for="mode in [Mode.Osu, Mode.Taiko, Mode.Fruits, Mode.Mania]" :key="mode" type="button"
              class="preset-option" :class="{ 'preset-option-active': mapFilters.mode === mode }"
              @click="mapFilters.mode = mode"
            >
              {{ mode === Mode.Fruits ? 'catch' : mode }}
            </button>
          </div>
          <div v-if="mapFilters.mode === Mode.Mania" class="preset-row">
            <button type="button" class="preset-label preset-active" @click="clearProperty('cs')">
              {{ t('key') }}
            </button>
            <button
              v-for="preset in [['4', '4K'], ['5', '5K'], ['6', '6K'], ['7', '7K'], ['8', '8K'], ['9', '9K'], ['10', '10K']]"
              :key="preset[0]" type="button" class="preset-option"
              :class="{ 'preset-option-active': mapFilters.csEq === preset[0] }" @click="setPreset('cs', preset[0])"
            >
              {{ preset[1] }}
            </button>
          </div>
          <label class="filter-option filter-option-accent">
            <input
              :checked="customRanked" type="checkbox" class="checkbox checkbox-sm"
              @change="toggleCustomRanked"
            >
            <span>{{ t('custom-ranked') }}</span>
          </label>
          <label class="filter-option">
            <input v-model="mapsetOnly" type="checkbox" class="checkbox checkbox-sm" @change="updateMapsetOnly">
            <span>{{ t('mapset-only') }}</span>
          </label>
          <div class="collapse collapse-arrow rounded-none">
            <input
              id="advanced" v-model="mapFilters.advanced" class="hidden" type="checkbox"
              :disabled="advancedSearchAllowed === false"
            >
            <label
              for="advanced" class="collapse-title px-0 pt-1 min-h-0 align-middle"
              :class="{ 'filter-disabled': advancedSearchAllowed === false }"
            >
              {{ t('advanced') }}
              <div v-if="advancedSearchAllowed === false" class="advanced-locked align-middle">
                <icon name="ion:lock-closed-outline" class="h-4 w-4" />
                {{ t('advanced-locked') }}
              </div>
            </label>
            <fieldset v-if="advancedSearchAllowed !== false" class="collapse-content p-0 rounded-none bg-transparent space-y-3">
              <div
                v-for="[key, val] in [['cs', mapFilters.mode === Mode.Mania ? t('key') : t('cs')], ['ar', t('ar')], ['od', t('od')], ['star', t('star')]]"
                :key="key" class="advanced-row"
              >
                <span class="advanced-label">{{ val }}</span>
                <span class="input input-bordered advanced-join join">
                  <div class="join-item advanced-input">
                    <kbd class="kbd kbd-sm operator-static">=</kbd>
                    <input
                      v-model="mapFilters[`${key}Eq` as keyof typeof mapFilters]" type="number" min="0"
                      :step="mapFilters.mode === Mode.Mania && key === 'cs' ? 1 : 0.1" class="filter-input grow"
                      :aria-label="`${val} =`"
                    >
                  </div>
                  <div class="join-item advanced-input">
                    <span class="operator-radio-group" role="radiogroup" :aria-label="`${val} lower operator`">
                      <input
                        :id="`${key}-gte`" v-model="mapFilters[`${key}MinOp` as keyof typeof mapFilters]"
                        type="radio" :name="`${key}-min-operator`" value="gte" class="operator-radio hidden"
                      >
                      <label :for="`${key}-gte`" class="kbd kbd-sm operator-radio-label">&gt;=</label>
                      <input
                        :id="`${key}-gt`" v-model="mapFilters[`${key}MinOp` as keyof typeof mapFilters]"
                        type="radio" :name="`${key}-min-operator`" value="gt" class="operator-radio hidden"
                      >
                      <label :for="`${key}-gt`" class="kbd kbd-sm operator-radio-label">&gt;</label>
                    </span>
                    <input
                      v-model="mapFilters[`${key}Min` as keyof typeof mapFilters]" type="number" min="0"
                      :step="mapFilters.mode === Mode.Mania && key === 'cs' ? 1 : 0.1" class="filter-input grow"
                      :aria-label="`${val} lower bound`"
                    >
                  </div>
                  <div class="join-item advanced-input">
                    <span class="operator-radio-group" role="radiogroup" :aria-label="`${val} upper operator`">
                      <input
                        :id="`${key}-lt`" v-model="mapFilters[`${key}MaxOp` as keyof typeof mapFilters]"
                        type="radio" :name="`${key}-max-operator`" value="lt" class="operator-radio hidden"
                      >
                      <label :for="`${key}-lt`" class="kbd kbd-sm operator-radio-label">&lt;</label>
                      <input
                        :id="`${key}-lte`" v-model="mapFilters[`${key}MaxOp` as keyof typeof mapFilters]"
                        type="radio" :name="`${key}-max-operator`" value="lte" class="operator-radio hidden"
                      >
                      <label :for="`${key}-lte`" class="kbd kbd-sm operator-radio-label">&lt;=</label>
                    </span>
                    <input
                      v-model="mapFilters[`${key}Max` as keyof typeof mapFilters]" type="number" min="0"
                      :step="mapFilters.mode === Mode.Mania && key === 'cs' ? 1 : 0.1" class="filter-input grow"
                      :aria-label="`${val} upper bound`"
                    >
                  </div>
                </span>
              </div>
              <!-- <div class="length-control">
                <label class="filter-control">
                  <input v-model="mapFilters.lengthEnabled" type="checkbox" class="checkbox checkbox-xs">
                  <span>{{ t('length') }}</span>
                  <span>{{ formatLength(mapFilters.lengthMin) }} - {{ mapFilters.lengthMax === 600 ? `${formatLength(mapFilters.lengthMax)}+` : formatLength(mapFilters.lengthMax) }}</span>
                </label>
                <div class="length-slider" :style="{ '--length-min': lengthMinPercent, '--length-max': lengthMaxPercent }">
                  <div class="length-track" />
                  <div class="length-selection" />
                  <input
                    v-model.number="mapFilters.lengthMin"
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    class="length-thumb length-thumb-min"
                    :aria-label="`${t('length')} minimum`"
                    :disabled="!mapFilters.lengthEnabled"
                    @input="updateLengthMin"
                  >
                  <input
                    v-model.number="mapFilters.lengthMax"
                    type="range"
                    min="0"
                    max="600"
                    step="1"
                    class="length-thumb length-thumb-max"
                    :aria-label="`${t('length')} maximum`"
                    :disabled="!mapFilters.lengthEnabled"
                    @input="updateLengthMax"
                  >
                </div>
              </div> -->
            </fieldset>
          </div>
        </div>
        <div class="search-actions">
          <button type="submit" class="search-submit">
            <icon name="ion:search-outline" class="w-5 h-5" />
            {{ t('search-action') }}
          </button>
        </div>
      </form>
    </section>

    <section class="search-results" aria-live="polite">
      <div v-if="groupedLoading || loading.users" class="search-status">
        <span class="loading loading-spinner loading-sm" /> {{ t('searching') }}
      </div>
      <div v-else-if="hasSearched && (searchTarget === 'beatmaps' ? groupedNothing : nothing)" class="search-status">
        {{ t('nothing') }}
      </div>

      <template v-if="searchTarget === 'beatmaps'">
        <div v-if="groupedBeatmapsets?.length" class="result-group-title">
          {{ t('beatmapsets') }}
        </div>
        <ul v-if="groupedBeatmapsets?.length" class="result-list">
          <template v-for="bs in groupedBeatmapsets" :key="`bs-${bs.id}`">
            <li class="result-row">
              <nuxt-link-locale :to="{ name: 'beatmapset-id', params: { id: bs.id } }" class="result-link">
                <img
                  v-if="isBanchoBeatmapset(bs)" :src="`https://b.ppy.sh/thumb/${bs.foreignId}.jpg`"
                  :onerror="onLazyImageError" class="result-cover"
                >
                <span class="result-copy"><strong>{{ bs.meta.intl.artist }}</strong><span>{{ bs.meta.intl.title
                }}</span></span>
                <icon name="ion:arrow-forward-outline" class="result-arrow" />
              </nuxt-link-locale>
            </li>
            <li v-for="bm in bs.beatmaps" :key="`bm-${bm.id}`" class="result-row result-row-child">
              <nuxt-link-locale
                :to="{ name: 'beatmapset-id', params: { id: bs.id }, query: { beatmap: bm.md5, mode: bm.mode } }"
                class="result-link beatmap-link"
              >
                <span class="result-copy">
                  <strong class="beatmap-diff">{{ bm.version }}</strong>
                  <span class="beatmap-stats">
                    <b class="status-label">{{ statusName(bm) }}</b>
                    <span>{{ t('star') }} {{ bm.properties.starRate.toFixed(2) }}</span>
                    <span>{{ bm.mode === Mode.Mania ? t('key') : t('cs') }} {{ bm.properties.circleSize }}</span>
                    <span>{{ t('ar') }} {{ bm.properties.approachRate }}</span>
                    <span>{{ t('od') }} {{ bm.properties.accuracy }}</span>
                    <span>{{ formatLength(bm.properties.totalLength) }}</span>
                  </span>
                </span>
                <icon name="ion:arrow-forward-outline" class="result-arrow" />
              </nuxt-link-locale>
            </li>
          </template>
        </ul>
        <div v-if="groupedHasMore" class="load-more">
          <button type="button" class="btn btn-ghost" :disabled="groupedLoading" @click="loadMoreGroupedBeatmapsets">
            <span v-if="groupedLoading" class="loading loading-spinner loading-sm" />
            {{ t('load-more') }}
          </button>
        </div>
      </template>

      <template v-if="searchTarget === 'users'">
        <div v-if="users?.length" class="result-group-title">
          {{ t('users') }}
        </div>
        <ul v-if="users?.length" class="result-list">
          <li v-for="user in users" :key="`user-${user.safeName}`" class="result-row">
            <nuxt-link-locale
              :to="{ name: 'user-handle', params: { handle: `@${user.safeName}` } }"
              class="result-link"
            >
              <img :src="user.avatarSrc" :onerror="onLazyImageError" class="result-avatar">
              <span class="result-copy"><strong>{{ user.name }}</strong><span>@{{ user.safeName }}</span></span>
              <icon name="ion:arrow-forward-outline" class="result-arrow" />
            </nuxt-link-locale>
          </li>
        </ul>
      </template>
    </section>
  </main>
</template>

<style lang="postcss" scoped>
.search-page {
  @apply w-full max-w-screen-lg;
}

.search-intro {
  @apply px-2 md:px-6;
}

.search-field {
  @apply flex h-12 items-center gap-3 text-base-content;
}

.search-field input {
  @apply grow bg-transparent text-lg outline-none;
}

.search-field input::placeholder {
  color: hsl(var(--bc) / 0.55);
}

.icon-button {
  @apply btn btn-ghost btn-circle btn-sm shrink-0;
}

.filter-option {
  @apply inline-flex cursor-pointer items-center gap-2 text-sm text-base-content/70 transition-colors;
}

.filter-option:hover,
.filter-option-accent {
  @apply text-base-content;
}

.filter-disabled {
  @apply cursor-not-allowed opacity-45;
}

.search-target {
  @apply mt-5 flex w-fit border-b border-base-content/20;
}

.target-option {
  @apply inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-sm font-semibold text-base-content/55 transition-colors;
}

.target-option:hover,
.target-option-active {
  @apply text-base-content;
  border-color: hsl(var(--p));
}

.search-filters {
  @apply mt-4 flex flex-wrap items-end gap-x-4 gap-y-3;
}

.filter-heading {
  @apply basis-full text-xs font-bold uppercase tracking-wider text-base-content/50;
}

.preset-row {
  @apply flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-sm;
}

.preset-label,
.preset-option {
  @apply border-b border-transparent py-1 text-base-content/60 transition-colors;
}

.preset-label {
  @apply min-w-12 text-left font-semibold;
}

.preset-option:hover,
.preset-option-active,
.preset-label:hover {
  @apply text-base-content;
  border-color: hsl(var(--p));
}

.filter-control {
  @apply flex items-center gap-2 text-sm text-base-content/70;
}

.filter-select,
.filter-input {
  @apply h-8 border-b border-base-content/25 bg-transparent px-1 text-sm text-base-content outline-none transition-colors;
}

.filter-select:focus,
.filter-input:focus {
  border-color: hsl(var(--p));
}

.filter-input {
  @apply w-16;
}

.advanced-row {
  @apply flex w-full flex-wrap items-center gap-3;
}

.advanced-locked {
  @apply ps-5 inline-flex gap-1 text-sm text-base-content/45;
}

.advanced-label {
  @apply w-12 font-semibold text-base-content/70;
}

.advanced-input {
  @apply flex items-center gap-1 text-xs text-base-content/60;
}

.advanced-join .filter-input {
  @apply input input-sm h-full w-20 rounded-none border-0 bg-transparent;
}

.operator-static,
.operator-radio-label {
  @apply flex h-6 w-9 items-center justify-center text-sm font-semibold;
}

.operator-radio-group {
  @apply join;

  &>.operator-radio-label {
    @apply rounded-none;

    &:first-of-type {
      @apply rounded-s-btn;
    }

    &:last-of-type {
      @apply rounded-e-btn;
    }
  }
}

.operator-radio-label {
  @apply cursor-pointer transition-opacity;
  @apply opacity-20;
}

.operator-radio-label:hover {
  @apply opacity-80;
}

.operator-radio:checked+.operator-radio-label {
  @apply opacity-100;
}

.search-submit {
  @apply btn btn-primary btn-sm ml-auto gap-2;
}

.search-actions {
  @apply mt-4 flex justify-end;
}

.length-control {
  @apply min-w-60;
}

.length-slider {
  @apply relative mt-2 h-5 w-full;
}

.length-track,
.length-selection {
  @apply absolute top-1/2 h-1 -translate-y-1/2 rounded-full;
}

.length-track {
  @apply inset-x-0 bg-base-content/20;
}

.length-selection {
  left: var(--length-min);
  right: calc(100% - var(--length-max));
  background: hsl(var(--p));
}

.length-thumb {
  @apply pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent;
  margin: 0;
}

.length-thumb::-webkit-slider-runnable-track {
  @apply h-1 bg-transparent;
}

.length-thumb::-moz-range-track {
  @apply h-1 bg-transparent;
}

.length-thumb::-webkit-slider-thumb {
  @apply pointer-events-auto relative h-4 w-4 cursor-grab appearance-none rounded-full border-2 border-base-100 bg-primary shadow-sm;
  margin-top: -6px;
}

.length-thumb::-moz-range-thumb {
  @apply pointer-events-auto h-4 w-4 cursor-grab rounded-full border-2 border-base-100 bg-primary shadow-sm;
}

.length-thumb:active::-webkit-slider-thumb,
.length-thumb:focus-visible::-webkit-slider-thumb,
.length-thumb:active::-moz-range-thumb,
.length-thumb:focus-visible::-moz-range-thumb {
  @apply scale-110;
}

.length-thumb-min {
  z-index: 2;
}

.length-thumb-max {
  z-index: 1;
}

.search-results {
  @apply px-2 pb-10 md:px-6;
}

.search-status {
  @apply px-2 py-10 text-center text-base-content/70;
}

.search-status-muted {
  @apply text-base-content/45;
}

.load-more {
  @apply flex justify-center py-6;
}

.result-group-title {
  @apply border-b border-base-content/10 px-2 pb-2 pt-8 text-xs font-bold uppercase tracking-wider text-base-content/55;
}

.result-list {
  @apply divide-y divide-base-content/10;
}

.result-row {
  @apply transition-colors hover:bg-base-content/5;
  @apply bg-base-200/20;
}

.result-row-child {
  @apply bg-base-100/20 border-t-base-content/20;
}

.result-row-child .result-link {
  @apply min-h-5 py-0 pl-14 sm:pl-20;
}

.result-link {
  @apply flex min-h-16 items-center gap-3 px-2 py-3 sm:px-3;
}

.result-icon,
.result-arrow {
  @apply shrink-0 text-base-content/45;
}

.result-arrow {
  @apply ml-auto self-center;
}

.result-cover,
.result-avatar {
  @apply h-10 w-10 shrink-0 object-cover;
}

.result-cover {
  @apply rounded-md;
}

.result-avatar {
  @apply rounded-full;
}

.result-copy {
  @apply flex min-w-0 flex-col gap-0.5;
}

.result-copy strong,
.result-copy span {
  @apply overflow-hidden text-ellipsis whitespace-nowrap;
}

.result-copy strong {
  @apply font-semibold;
}

.result-copy span {
  @apply text-sm text-base-content/60;
}

.beatmap-link {
  @apply items-start !py-0.5;
}

.beatmap-stats {
  @apply flex items-center gap-x-2 overflow-hidden !text-xs whitespace-nowrap text-base-content/55;
}

.beatmap-diff {
  @apply text-sm font-medium text-base-content/80;
}

.status-label {
  @apply font-semibold text-primary;
}
</style>
