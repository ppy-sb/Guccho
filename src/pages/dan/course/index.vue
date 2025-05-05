<script setup lang="ts">
import { Mode, Ruleset } from '~/def'

const tMode = localeKey.root.mode
const tRule = localeKey.root.ruleset

const app = useNuxtApp()
const server = useAdapterConfig()
const { t } = useI18n()
const r = useRoute()

const isSafari = safariDetector()

useHead({
  title: app.$i18n.t(localeKey.title.dan.courses.__path__),
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
})

const query = ref({
  keyword: r.query.s?.toString() ?? '',
  page: 0,
  perPage: 10,
  mode: undefined as Mode | undefined,
  ruleset: undefined as Ruleset | undefined,
  rulesetDefaultsToStandard: false,
  mania: {
    keyCount: undefined as number | undefined,
  },
})

const { data, refresh, status } = await app.$client.dan.course.search.useQuery(query)

const pages = computed(() => Math.ceil((data.value?.total || 0) / (query.value.perPage)))

async function validateAndRefresh() {
  // check ruleset
  if (query.value.mode && query.value.ruleset && !server.hasRuleset(query.value.mode, query.value.ruleset)) {
    query.value.ruleset = undefined
  }

  query.value.page = 0

  await refresh()
}

function toPage(n: number) {
  query.value.page = n
  return refresh()
}
</script>

<i18n lang="yaml">
en-GB:
  search-text: Search courses...
  search: Search
  detail: Detail
  mode: Mode
  ruleset: Rule
  unset: Unset
  treat-no-ruleset-cond-as-standard: treat dans with no ruleset requirement as standard
  key: Key count
  collection: Course
  full-name: FQDN (fully qualified dan name)
  description: Description
  requirements: Requirements
  dan: Dan

zh-CN:
  search-text: 搜索段位...
  search: 搜索
  detail: 详细
  mode: 模式
  ruleset: 玩法
  unset: 未指定
  treat-no-ruleset-cond-as-standard: 将无玩法要求的段位视为std端位
  key: 键数
  collection: 组别
  full-name: 全名
  description: 描述
  requirements: 要求
  dan: 段位

# TODO fr, DE
</i18n>

<template>
  <section
    class="container px-2 mx-auto custom-container"
    :class="{
      'is-safari': isSafari,
    }"
  >
    <form :action="useRequestURL().href" method="get" @submit.prevent="validateAndRefresh()">
      <div class="grid grid-cols-4 pb-2 space-x-2 gap-y-2 lg:grid-cols-12">
        <div class="col-span-2 form-control">
          <div class="label">
            <span class="label-text">{{ t('mode') }}</span>
          </div>
          <select id="" v-model="query.mode" name="mode" class="select select-bordered" @change="() => validateAndRefresh()">
            <option :value="undefined">
              {{ t('unset') }}
            </option>
            <option v-for="mode in Object.values(Mode)" :key="mode" :value="mode">
              {{ t(tMode[mode].__path__) }}
            </option>
          </select>
        </div>
        <div class="col-span-2 form-control">
          <div class="label">
            <span class="label-text">{{ t('ruleset') }}</span>
          </div>
          <select id="" v-model="query.ruleset" name="ruleset" class="select select-bordered" @change="() => validateAndRefresh()">
            <option :value="undefined">
              {{ t('unset') }}
            </option>
            <option v-for="ruleset in Object.values(Ruleset)" :key="ruleset" :value="ruleset" :disabled="query.mode ? !server.hasRuleset(query.mode, ruleset) : false">
              {{ t(tRule[ruleset].__path__) }}
            </option>
          </select>
        </div>
        <div v-show="query.mode === Mode.Mania" class="col-span-2 form-control">
          <div class="label">
            <span class="label-text">{{ t('key') }}</span>
          </div>
          <select id="" v-model="query.mania.keyCount" name="ruleset" class="select select-bordered" @change="() => validateAndRefresh()">
            <option :value="undefined">
              {{ t('unset') }}
            </option>
            <option v-for="(_, keyCount) in 9" :key="keyCount" :value="keyCount + 2">
              {{ keyCount + 2 }}K
            </option>
          </select>
        </div>
        <div class="justify-end col-span-6 md:col-span-4 form-control">
          <label class="justify-start gap-2 cursor-pointer label">
            <span class="label-text">{{ t('treat-no-ruleset-cond-as-standard') }}</span>
            <input v-model="query.rulesetDefaultsToStandard" type="checkbox" class="toggle" @change="() => validateAndRefresh()">
          </label>
        </div>
      </div>
      <label for="keyword" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">{{ t('search') }}</label>
      <div class="relative">
        <div class="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input id="keyword" v-model="query.keyword" name="keyword" type="search" class="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg ps-10 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" :placeholder="t('search-text')">
        <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          {{ t('search') }}
          <icon name="ion:search-outline" class="w-4 h-4" />
        </button>
      </div>
    </form>

    <div v-if="data" class="relative pt-4 space-y-4">
      <span class="text-sm text-gbase-500">found {{ data.total }} results.</span>

      <div class="relative overflow-x-auto border rounded-lg border-base-300 bg-base-100">
        <table class="table w-full table-sm">
          <thead>
            <tr>
              <th class="w-0">
                {{ t('collection') }}
              </th>
              <th />
              <th>{{ t('dan') }}</th>
              <th>{{ t('full-name') }}</th>
            </tr>
          </thead>
          <tbody v-if="data" class="relative">
            <template v-for="(course, courseIdx) in data.data" :key="course.id">
              <template v-for="(dan, index) in course.dans" :key="dan.id">
                <!-- Main dan row -->
                <tr
                  class="hover:bg-base-200 css-expand"
                  :class="{
                    '[&>*]:bg-base-200/50': ((courseIdx + index) % 2) === 0,
                  }"
                >
                  <th
                    v-if="index === 0"
                    :rowspan="course.dans.length * 2"
                    class="whitespace-pre align-top border-r border-base-300/50 is-collection"
                  >
                    <nuxt-link-locale
                      :to="{
                        name: 'dan-course-detail-id',
                        params: { id: course.id },
                      }"
                      class="font-bold link"
                    >
                      {{ course.name }}
                    </nuxt-link-locale>
                  </th>
                  <td
                    class="w-0"
                  >
                    <label class="swap swap-rotate">
                      <!-- this hidden checkbox controls the state -->
                      <input type="checkbox">

                      <!-- hamburger icon -->
                      <svg
                        class="fill-current swap-off"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
                      </svg>

                      <!-- close icon -->
                      <svg
                        class="fill-current swap-on"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <polygon
                          points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49"
                        />
                      </svg>
                    </label>
                  </td>
                  <th
                    class="align-top"
                  >
                    {{ dan.shortName }}
                  </th>
                  <td
                    class="align-top"
                  >
                    <div class="whitespace-pre">
                      <nuxt-link-locale
                        :to="{
                          name: 'dan-detail-id',
                          params: { id: dan.id },
                        }"
                        class="font-bold link"
                      >
                        {{ dan.name }}
                      </nuxt-link-locale>
                    </div>
                  </td>
                </tr>

                <!-- Expanded content -->
                <tr
                  class="css-expand-content"
                  :class="{
                    '[&>*]:bg-base-200/50': ((courseIdx + index) % 2) === 0,
                  }"
                >
                  <td colspan="99">
                    <div class="whitespace-pre">
                      {{ dan.description }}
                    </div>
                    <div class="mt-2">
                      <div class="mb-2 font-medium">
                        {{ t('requirements') }}
                      </div>
                      <div class="space-y-2">
                        <dan-explain-requirement
                          v-for="requirement in dan.requirements"
                          :key="requirement.type"
                          :requirement="requirement"
                        />
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
      <div class="flex pt-4">
        <div class="mx-auto join">
          <template v-for="(i, n) in pages" :key="`sw${i}`">
            <button
              v-if="n === 0" class="join-item btn"
              :class="{
                'btn-active': n === query.page,
              }"
              @click="toPage(n)"
            >
              {{ Math.abs(n - query.page) > 3 && '|&lt;' || '' }} {{ i }}
            </button>
            <button
              v-else-if="Math.abs(n - query.page) <= 3"
              class="join-item btn"
              :class="{
                'btn-active': n === query.page,
              }"
              @click="toPage(n)"
            >
              {{ i }}
            </button>
            <button
              v-else-if="i === pages" class="join-item btn"
              :class="{
                'btn-active': n === query.page,
              }"
              @click="toPage(n)"
            >
              {{ i }} &gt;|
            </button>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="postcss">
.css-expand-content {
  visibility: collapse;
}

.is-safari {
  .css-expand-content {
    position: absolute;
    visibility: hidden;
  }

  .css-expand {

    &:has(td input:checked) + .css-expand-content {
      visibility: visible;
      position: relative;
    }
  }
}

.css-expand {
  &:has(td input:checked) > :not(.is-collection) {
    /* @apply bg-error/10 */
  }
  &:has(td input:checked) + .css-expand-content {
    visibility: visible;
  }
}
</style>
