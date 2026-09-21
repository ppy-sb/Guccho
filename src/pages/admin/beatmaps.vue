<script setup lang="tsx">
import { $enum } from 'ts-enum-util'
import { OsuDirect } from '../../common/utils'
import type { AdminMapProvider } from '$base/server/admin/map'
import { Mode } from '~/def'
import { BeatmapSource, RankingStatus } from '~/def/beatmap'
import { mode as modeIcon } from '~/common/icon'

const rankStatus = $enum(RankingStatus)
const filterableRankStatuses = [
  [RankingStatus.Pending, 'Pending / Graveyard'],
  [RankingStatus.Ranked, 'Ranked'],
  [RankingStatus.Approved, 'Approved'],
  [RankingStatus.Qualified, 'Qualified'],
  [RankingStatus.Loved, 'Loved'],
] as const

const app = useNuxtApp()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const search = ref<AdminMapProvider.SearchOpt>({
  keyword: typeof route.query.keyword === 'string' ? route.query.keyword : '',
  mode: Object.values(Mode).includes(route.query.mode as Mode) ? route.query.mode as Mode : undefined,
  keyCount: typeof route.query.keyCount === 'string' ? Number(route.query.keyCount) : undefined,
  rankingStatus: typeof route.query.rankingStatus === 'string'
    ? route.query.rankingStatus.split(',').map(Number).filter(status => filterableRankStatuses.some(([value]) => value === status)) as RankingStatus[]
    : [],
  page: typeof route.query.page === 'string' ? Number(route.query.page) || 0 : 0,
  frozen: route.query.frozen === 'true' ? true : undefined,
  orderBy: route.query.orderBy === 'natural' || route.query.orderBy === 'desc' || route.query.orderBy === 'votes'
    ? route.query.orderBy
    : 'votes',
  perPage: 10,
})

const query = ref({ ...search.value })
const { data, refresh, status } = await app.$client.admin.map.search.useQuery(query, { immediate: false, dedupe: 'cancel' })
const pages = computed(() => Math.ceil((data.value?.total || 0) / (query.value.perPage ?? 10)))

const batch = ref(new Map<string, AdminMapProvider.VeryCompactBeatmap<string, string>>())

watch(() => search.value.mode, (mode) => {
  if (mode !== Mode.Mania) {
    search.value.keyCount = undefined
  }
})

function searchQuery(overrides: Partial<AdminMapProvider.SearchOpt> = {}) {
  const params = { ...search.value, ...overrides }
  return {
    keyword: params.keyword || undefined,
    mode: params.mode?.toString(),
    keyCount: params.keyCount?.toString(),
    rankingStatus: params.rankingStatus?.join(',') || undefined,
    frozen: params.frozen ? 'true' : undefined,
    orderBy: params.orderBy,
    page: params.page ? params.page.toString() : undefined,
  }
}

function paramsForCheckingVotesClicked() {
  return searchQuery({ rankingStatus: [], frozen: undefined, orderBy: 'votes', page: 0 })
}

function paramsForCustomClicked() {
  return searchQuery({ frozen: true, orderBy: 'desc', page: 0 })
}

function paramsForAllClicked() {
  return searchQuery({ frozen: undefined, orderBy: 'desc', page: 0 })
}

function updateUrl() {
  router.replace({ query: searchQuery() })
}

async function doSearch() {
  batch.value = new Map()
  query.value = { ...search.value }
  updateUrl()
  await refresh()
}

async function onCheckingVotesSelected() {
  Object.assign(search.value, {
    rankingStatus: [],
    frozen: undefined,
    orderBy: 'votes',
    page: 0,
  })
  await doSearch()
}

async function onCustomSelected() {
  Object.assign(search.value, {
    frozen: true,
    orderBy: 'desc',
    page: 0,
  })
  await doSearch()
}

async function onAllSelected() {
  Object.assign(search.value, {
    frozen: undefined,
    orderBy: 'desc',
    page: 0,
  })
  await doSearch()
}

function resetSearch() {
  Object.assign(search.value, {
    keyword: '',
    mode: undefined,
    keyCount: undefined,
    rankingStatus: [],
    frozen: undefined,
    orderBy: 'votes',
    page: 0,
  })
  data.value = null
  batch.value = new Map()
  updateUrl()
}

function batchAdd(bm: AdminMapProvider.VeryCompactBeatmap<string, string>) {
  batch.value.set(bm.id, bm)
}

// function updateBeatmap(bm: AdminMapProvider.VeryCompactBeatmap<string, string>) {
//   return app.$client.admin.map.updateBeatmap.mutate({ id: bm.id, status: bm.status })
// }
async function update() {
  const result = await Promise.all([...batch.value.entries()].map(async ([id, bm]) => [id, await app.$client.admin.map.updateBeatmap.mutate(bm)] as const))

  batch.value = new Map()

  // update data
  for (const [bid, bm] of result) {
    for (const [sIdx, d] of data.value!.data.entries()) {
      const index = d.maps.findIndex(v => v.id === bid)
      if (index !== undefined && index >= 0) {
        const v = data.value!.data[index]
        data.value!.data[sIdx].maps[index] = {
          ...v,
          ...bm,
        }
      }
    }
  }
}
</script>

<i18n lang="yaml">
en-GB:
  mode: Mode
  key-count: Key count
  ranking-status: Ranking status
  search-parameters: Search Parameters
  preset: Preset
  checking-votes: Checking votes
  custom: Custom (BN adjusted)
  all: All maps
  reset: Reset
  order-by: Order by
  natural: Natural order
  desc: Descending (latest first)
  votes: Votes
  frozen: BN-adjusted maps only
  search-text: set id, beatmap id, artist, title, version, hash
  search: Search
  sid: Set ID
  artist: Artist
  song: Title
  bid: Map ID
  version: Version
  md5: Hash
  status: Status
  requested-by-player: Requested by player

zh-CN:
  mode: 模式
  key-count: 键数
  ranking-status: 谱面状态
  search-parameters: 高级搜索
  preset: 预设
  checking-votes: 检查投票
  custom: 自定义（BN 调整）
  all: 所有谱面
  reset: 重置
  order-by: 排序
  natural: 自然顺序
  desc: 顺序（最新优先）
  votes: 投票数
  frozen: 仅显示 BN 调整的谱面
  search-text: 集合 ID、谱面 ID、艺术家、标题、版本、哈希
  search: 搜索
  sid: 集合 ID
  artist: 艺术家
  song: 标题
  bid: 谱面 ID
  version: 版本
  md5: 哈希
  status: 状态
  requested-by-player: 玩家投票数

fr-FR:
  mode: Mode
  key-count: Nombre de touches
  ranking-status: Statut de classement
  search-parameters: Paramètres de recherche
  preset: Préréglage
  checking-votes: Vérification des votes
  custom: Personnalisé (ajusté par BN)
  all: Toutes les maps
  reset: Réinitialiser
  order-by: Trier par
  natural: Ordre naturel
  desc: Décroissant (plus récentes)
  votes: Votes
  frozen: Maps ajustées par BN uniquement
  search-text: ID de set, ID de beatmap, artiste, titre, version, hash
  search: Rechercher
  sid: ID du set
  artist: Artiste
  song: Titre
  bid: ID de la beatmap
  version: Version
  md5: Hash
  status: Statut
  requested-by-player: Votes des joueurs
</i18n>

<template>
  <div class="space-y-4">
    <div class="border rounded-lg collapse collapse-arrow border-base-300 bg-base-200 max-w-screen-2xl">
      <input type="checkbox" class="peer">
      <div class="font-medium collapse-title text-md">
        <span class="align-middle">{{ t('search-parameters') }}</span>
        <icon name="ion:search-outline" class="w-6 h-6 align-middle" />
      </div>
      <form :action="useRequestURL().href" method="get" class="space-y-6 collapse-content" @submit.prevent="doSearch">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          <div class="form-control col-span-1">
            <label class="label">
              <span class="label-text">{{ t('mode') }}</span>
            </label>
            <div class="flex gap-2">
              <img
                v-if="search.mode"
                :src="`/icons/mode/${modeIcon[search.mode].icon}.svg`"
                class="w-6 color-theme-light-invert"
              >
              <select v-model="search.mode" class="w-full select select-sm">
                <option :value="undefined" disabled>
                  {{ t('select') }}
                </option>
                <option
                  v-for="mode in Mode" :key="mode"
                  :selected="mode === search.mode" :value="mode"
                >
                  {{ $t(localeKey.mode(mode)) }}
                </option>
              </select>
            </div>
          </div>
          <div v-if="search.mode === Mode.Mania" class="form-control col-span-1">
            <label class="label">
              <span class="label-text">{{ t('key-count') }}</span>
            </label>
            <input v-model.number="search.keyCount" type="number" min="1" max="18" class="input input-sm w-full" placeholder="Any">
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('order-by') }}</span>
            </label>
            <select v-model="search.orderBy" class="select select-sm w-full">
              <option value="natural">
                {{ t('natural') }}
              </option>
              <option value="desc">
                {{ t('desc') }}
              </option>
              <option value="votes">
                {{ t('votes') }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">&nbsp;</span></label>
            <label class="label cursor-pointer justify-start gap-2 items-start">
              <input v-model="search.frozen" type="checkbox" class="checkbox checkbox-sm">
              <span class="label-text">{{ t('frozen') }}</span>
            </label>
          </div>
          <fieldset class="form-control">
            <legend class="label">
              <span class="label-text">{{ t('ranking-status') }}</span>
            </legend>
            <label v-for="[value, label] in filterableRankStatuses" :key="value" class="label cursor-pointer justify-start gap-2 py-1">
              <input v-model="search.rankingStatus" type="checkbox" class="checkbox checkbox-sm" :value="value">
              <span class="label-text">{{ label }}</span>
            </label>
          </fieldset>
          <div class="relative sm:col-span-2 lg:col-span-4 2xl:col-span-5">
            <input
              id="keyword"
              v-model="search.keyword"
              name="keyword"
              type="search"
              class="block w-full p-4 pe-44 text-sm text-gray-900 border border-gray-300 rounded-lg ps-10 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              :placeholder="t('search-text')"
            >
            <div class="absolute end-2.5 bottom-2.5 join">
              <button type="button" class="text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium text-sm px-3 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800 join-item" @click="resetSearch">
                <icon name="ion:refresh-outline" class="w-4 h-4" />
                {{ t('reset') }}
              </button>
              <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-800 dark:focus:ring-blue-800 join-item">
                {{ t('search') }}
                <icon name="ion:search-outline" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="flex flex-wrap gap-2">
      <nuxt-link-locale
        :to="{ name: 'admin-beatmaps', query: paramsForCheckingVotesClicked() }"
        class="btn btn-sm btn-link"
        @click.prevent="onCheckingVotesSelected"
      >
        {{ t('checking-votes') }}
      </nuxt-link-locale>
      <nuxt-link-locale
        :to="{ name: 'admin-beatmaps', query: paramsForCustomClicked() }"
        class="btn btn-sm btn-link"
        @click.prevent="onCustomSelected"
      >
        {{ t('custom') }}
      </nuxt-link-locale>
      <nuxt-link-locale
        :to="{ name: 'admin-beatmaps', query: paramsForAllClicked() }"
        class="btn btn-sm btn-link"
        @click.prevent="onAllSelected"
      >
        {{ t('all') }}
      </nuxt-link-locale>
    </div>

    <div class="space-y-4">
      <div v-if="data" class="flex justify-between">
        <span class="p-0 pointer-events-none btn btn-ghost btn-sm">{{ data.total }} results.</span>
        <button
          v-if="batch.size > 0"
          class="btn btn-primary btn-sm ms-4"
          @click="update"
        >
          Save
        </button>
      </div>
      <div class="overflow-x-auto 2xl:max-w-max border rounded-lg border-base-300/50 bg-base-100">
        <table class="table table-xs table-zebra 2xl:w-max">
          <thead>
            <tr>
              <th>
                {{ t('sid') }}
              </th>
              <th class="">
                {{ t('artist') }}
              </th>
              <th class="">
                {{ t('song') }}
              </th>
              <th class="border-l border-base-300/50">
                {{ t('version') }}
              </th>
              <th class="">
                {{ t('bid') }}
              </th>

              <th class="">
                {{ t('md5') }}
              </th>
              <th class="">
                {{ t('requested-by-player') }}
              </th>
              <th class="">
                {{ t('status') }}
              </th>
            </tr>
          </thead>
          <tbody
            v-if="data" class="transition-opacity origin-center transition-filter"
            :class="{
              'opacity-30 saturate-50 blur-md': status === 'pending',
            }"
          >
            <template v-for="beatmapset in data.data" :key="beatmapset.id">
              <tr>
                <th :rowspan="beatmapset.maps.length" role="rowheader" class="w-0 font-mono align-baseline text-end">
                  <a
                    v-if="beatmapset.source === BeatmapSource.Bancho"
                    class="text-green-600 link visited:text-violet-500" :href="OsuDirect.link(OsuDirect.Type.Beatmapset, beatmapset.foreignId)"
                  >
                    {{ beatmapset.id }}
                  </a>
                  <span v-else>{{ beatmapset.id }}</span>
                </th>
                <th :rowspan="beatmapset.maps.length" role="rowheader" class="w-0 whitespace-pre align-baseline">
                  {{ beatmapset.meta.intl.artist }}
                </th>
                <th :rowspan="beatmapset.maps.length" role="rowheader" class="w-0 whitespace-pre align-baseline">
                  <nuxt-link-locale
                    class="text-sky-600 link visited:text-purple-500"
                    :to="{ name: 'beatmapset-id', params: { id: beatmapset.id }, query: { mode: query.mode } }"
                  >
                    {{ beatmapset.meta.intl.title }}
                  </nuxt-link-locale>
                </th>
                <app-var v-slot="{ value: firstMap }" :value="beatmapset.maps[0]">
                  <th class="w-0 border-l border-base-300/50 text-nowrap">
                    {{ firstMap.version }}
                  </th>
                  <th class="w-0 font-mono text-end">
                    <a
                      v-if="firstMap.foreignId"
                      class="text-green-600 link visited:text-violet-500" :href="OsuDirect.link(OsuDirect.Type.Beatmap, firstMap.foreignId)"
                    >{{ firstMap.id }}</a>
                    <span v-else>{{ firstMap.id }}</span>
                  </th>
                  <td class="font-mono align-baseline">
                    <nuxt-link-locale
                      class="link text-sky-600 visited:text-purple-500"
                      :to="{ name: 'beatmapset-id', params: { id: beatmapset.id }, query: { mode: query.mode, beatmap: firstMap.md5 } }"
                    >
                      {{ firstMap.md5 }}
                    </nuxt-link-locale>
                  </td>
                  <th class="w-0 font-mono text-end">
                    {{ firstMap.vote }}
                  </th>
                  <td class="align-baseline">
                    <div class="form-control">
                      <select
                        v-model="firstMap.status"
                        class="select select-sm"
                        @change="batchAdd(firstMap)"
                      >
                        <option
                          v-for="([key, status]) in rankStatus.entries()"
                          :key="key"
                          :selected="status === firstMap.status"
                          :value="status"
                        >
                          {{ key }}
                        </option>
                      </select>
                    </div>
                  </td>
                </app-var>
              </tr>
              <template v-for="bm in beatmapset.maps.slice(1)" :key="bm.md5">
                <tr>
                  <th class="border-l border-base-300/50 text-nowrap">
                    {{ bm.version }}
                  </th>
                  <th class="font-mono text-end">
                    <a
                      v-if="bm.foreignId"
                      class="text-green-600 link visited:text-violet-500" :href="OsuDirect.link(OsuDirect.Type.Beatmap, bm.foreignId)"
                    >{{ bm.id }}</a>
                    <span v-else>{{ bm.id }}</span>
                  </th>

                  <td class="font-mono align-baseline">
                    <nuxt-link-locale
                      class="link text-sky-600 visitedd:text-purple-500"
                      :to="{ name: 'beatmapset-id', params: { id: beatmapset.id }, query: { mode: query.mode, beatmap: bm.md5 } }"
                    >
                      {{ bm.md5 }}
                    </nuxt-link-locale>
                  </td>
                  <th class="font-mono text-end">
                    {{ bm.vote ?? '-' }}
                  </th>
                  <td class="align-baseline">
                    <div>
                      <div class="form-control">
                        <select
                          v-model="bm.status"
                          class="select select-sm"
                          @change="batchAdd(bm)"
                        >
                          <option
                            v-for="([key, status]) in rankStatus.entries()"
                            :key="key"
                            :selected="status === bm.status"
                            :value="status"
                          >
                            {{ key }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
        <div
          class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none transition-filter blur-sm"
          :class="{
            'opacity-100 !blur-none': status === 'pending',
          }"
        >
          <div class="m-auto loading loading-lg" />
        </div>
      </div>
    </div>
    <div class="justify-center w-full join" :class="{ 'pointer-events-none': status === 'pending' }">
      <template v-for="(i, n) in pages" :key="`sw${i}`">
        <button
          v-if="n === 0" class="join-item btn"
          :class="{
            'btn-active': n === search.page,
          }"
          @click="(search.page = n, doSearch())"
        >
          {{ Math.abs(n - search.page) > 3 && '|&lt;' || '' }} {{ i }}
        </button>
        <button
          v-else-if="Math.abs(n - search.page) <= 3"
          class="join-item btn"
          :class="{
            'btn-active': n === search.page,
          }"
          @click="(search.page = n, doSearch())"
        >
          {{ i }}
        </button>
        <button
          v-else-if="i === pages" class="join-item btn"
          :class="{
            'btn-active': n === search.page,
          }"
          @click="(search.page = n, doSearch())"
        >
          {{ i }} &gt;|
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
