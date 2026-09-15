<i18n lang="yaml">
en-GB:
  title: Search
  placeholder: Search beatmaps and users
  all: All
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
  key: Key
  nothing: No results found.
  searching: Searching...

zh-CN:
  title: 搜索
  placeholder: 搜索谱面和用户
  all: 全部
  beatmapsets: 图组
  beatmaps: 铺面
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
  key: 键数
  nothing: 没有找到结果。
  searching: 搜索中...

fr-FR:
  title: Rechercher
  placeholder: Rechercher des beatmaps et des utilisateurs
  all: Tout
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
  key: Touches
  nothing: Aucun résultat.
  searching: Recherche...

de-DE:
  title: Suche
  placeholder: Beatmaps und Benutzer suchen
  all: Alle
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

useHead({
  title: () => t('title'),
})

const {
  includes,
  raw,
  loadMoreBeatmaps,
  hasMoreBeatmaps,
  keyword,
  tags,
  results: { beatmaps, beatmapsets, users },
  loading,
  nothing,
} = await useSearchResult()

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

function setTarget(target: typeof searchTarget.value) {
  if (target !== searchTarget.value) {
    hasSearched.value = false
  }
  searchTarget.value = target
  includes.beatmapsets = target === 'beatmaps'
  includes.beatmaps = target === 'beatmaps'
  includes.users = target === 'users'
  includes.pages = false
}

function submit() {
  syncMapFilters()
  hasSearched.value = true
  raw(true)
  router.replace({
    query: {
      ...(keyword.value ? { q: keyword.value } : {}),
      target: searchTarget.value,
    },
  })
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
  hasSearched.value = Boolean(next)
}, { immediate: true })

watch(() => route.query.target, (target) => {
  setTarget(target === 'users' ? 'users' : 'beatmaps')
  if (typeof route.query.q === 'string' && route.query.q) {
    hasSearched.value = true
  }
}, { immediate: true })

function formatLength(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

// const lengthMinPercent = computed(() => `${(mapFilters.lengthMin / 600) * 100}%`)
// const lengthMaxPercent = computed(() => `${(mapFilters.lengthMax / 600) * 100}%`)

// function updateLengthMin() {
//   mapFilters.lengthMin = Math.min(mapFilters.lengthMin, mapFilters.lengthMax)
// }

// function updateLengthMax() {
//   mapFilters.lengthMax = Math.max(mapFilters.lengthMax, mapFilters.lengthMin)
// }

function statusName(beatmap: unknown) {
  if (!beatmap || typeof beatmap !== 'object' || !('status' in beatmap)) {
    return RankingStatus.Unknown
  }
  const status = (beatmap as { status: RankingStatus }).status
  return typeof status === 'number' ? RankingStatus[status] : status
}

setTarget(searchTarget.value)
</script>

<template>
  <main class="container mx-auto custom-container search-page">
    <section class="search-intro">
      <form class="mt-6" @submit.prevent="submit">
        <label class="sr-only" for="search-keyword">{{ t('title') }}</label>
        <label class="input input-bordered search-field">
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
            <input :checked="customRanked" type="checkbox" class="checkbox checkbox-sm" @change="toggleCustomRanked">
            <span>{{ t('custom-ranked') }}</span>
          </label>
          <div class="collapse collapse-arrow rounded-none">
            <input id="advanced" v-model="mapFilters.advanced" class="hidden" type="checkbox">
            <label for="advanced" class="collapse-title px-0 pt-1 min-h-0">
              {{ t('advanced') }}
            </label>
            <div class="collapse-content p-0 rounded-none bg-transparent space-y-3">
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
            </div>
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
      <div v-if="loading.beatmapsets || loading.beatmaps || loading.users" class="search-status">
        <span class="loading loading-spinner loading-sm" /> {{ t('searching') }}
      </div>
      <div v-else-if="hasSearched && nothing" class="search-status">
        {{ t('nothing') }}
      </div>

      <template v-if="searchTarget === 'beatmaps'">
        <div v-if="beatmaps?.length" class="result-group-title">
          {{ t('beatmaps') }}
        </div>
        <ul v-if="beatmaps?.length" class="result-list">
          <li v-for="bm in beatmaps" :key="`bm-${bm.id}`" class="result-row">
            <nuxt-link-locale
              :to="{ name: 'beatmapset-id', params: { id: bm.beatmapset.id } }"
              class="result-link beatmap-link"
            >
              <img
                v-if="isBanchoBeatmapset(bm.beatmapset)"
                :src="`https://b.ppy.sh/thumb/${bm.beatmapset.foreignId}.jpg`" :onerror="onLazyImageError"
                class="result-cover"
              >
              <span class="result-copy">
                <strong>{{ bm.beatmapset.meta.intl.artist }} - {{ bm.beatmapset.meta.intl.title }} [{{ bm.version
                }}]</strong>
                <span>{{ t('mapper') }}: {{ bm.creator }}</span>
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
        </ul>
        <div v-if="hasMoreBeatmaps" class="load-more">
          <button type="button" class="btn btn-ghost" :disabled="loading.beatmaps" @click="loadMoreBeatmaps">
            <span v-if="loading.beatmaps" class="loading loading-spinner loading-sm" />
            {{ t('load-more') }}
          </button>
        </div>
        <div v-if="beatmapsets?.length" class="result-group-title">
          {{ t('beatmapsets') }}
        </div>
        <ul v-if="beatmapsets?.length" class="result-list">
          <li v-for="bs in beatmapsets" :key="`bs-${bs.id}`" class="result-row">
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
        </ul>
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
  @apply px-4 py-8 sm:px-8;
  background: color-mix(in srgb, hsl(var(--b2)) 82%, transparent);
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
  @apply mt-4 flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-base-content/15 pt-4;
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
  @apply px-2 pb-10 sm:px-6;
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
}

.result-link {
  @apply flex min-h-16 items-center gap-3 px-2 py-3 sm:px-3;
}

.result-icon,
.result-arrow {
  @apply shrink-0 text-base-content/45;
}

.result-arrow {
  @apply ml-auto;
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
  @apply items-start;
}

.beatmap-stats {
  @apply flex flex-wrap items-center gap-x-3 gap-y-1 !text-xs;
}

.status-label {
  @apply font-semibold text-primary;
}
</style>
