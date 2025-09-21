<script setup lang="tsx">
import { $enum } from 'ts-enum-util'
import { OsuDirect } from '../../common/utils'
import type { AdminMapProvider } from '$base/server/admin/map'
import { Mode } from '~/def'
import { BeatmapSource, RankingStatus } from '~/def/beatmap'
import { mode as modeIcon } from '~/common/icon'

const rankStatus = $enum(RankingStatus)

const app = useNuxtApp()
const { t } = useI18n()
const search = ref<AdminMapProvider.SearchOpt>({
  keyword: '',
  mode: undefined,
  page: 0,
  requested: false,
  perPage: 10,
})

const query = ref({ ...search.value })
const { data, refresh, status } = await app.$client.admin.map.search.useQuery(query, { immediate: false })
const pages = computed(() => Math.ceil((data.value?.total || 0) / (query.value.perPage ?? 10)))

const batch = ref(new Map<string, AdminMapProvider.VeryCompactBeatmap<string, string>>())

async function doSearch() {
  batch.value = new Map()
  query.value = { ...search.value }
  await refresh()
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
  search-text: 设置 ID、谱面 ID、艺术家、标题、版本、哈希
  search: 搜索
  sid: 集合 ID
  artist: 艺术家
  song: 标题
  bid: 谱面 ID
  version: 版本
  md5: 哈希
  status: 状态
  requested-by-player: 玩家投票数
</i18n>

<template>
  <div class="space-y-4 max-w-screen-2xl">
    <form :action="useRequestURL().href" method="get" class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4" @submit.prevent="doSearch">
      <div class="form-control">
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
      <div class="sm:col-span-2 md:col-span-4">
        <label for="keyword" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">{{ t('search') }}</label>
        <div class="relative">
          <div class="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <input
            id="keyword"
            v-model="search.keyword"
            name="keyword"
            type="search"
            class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg ps-10 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            :placeholder="t('search-text')"
          >
          <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            {{ t('search') }}
            <icon name="ion:search-outline" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>

    <div class="space-y-4">
      <div class="flex justify-between">
        <span v-if="data" class="p-0 pointer-events-none btn btn-ghost btn-sm">{{ data.total }} results.</span>
        <button
          v-if="batch.size > 0"
          class="btn btn-primary btn-sm ms-4"
          @click="update"
        >
          Save
        </button>
      </div>
      <div class="overflow-x-auto border rounded-lg border-base-300/50 bg-base-100">
        <table class="table table-xs table-zebra">
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
