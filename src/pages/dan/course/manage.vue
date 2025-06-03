<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { Mode, Ruleset } from '~/def'

const tMode = localeKey.root.mode
const tRule = localeKey.root.ruleset

definePageMeta({
  middleware: ['auth', 'bn'],
})

const app = useNuxtApp()
const server = useAdapterConfig()
const { t, locale } = useI18n()
const r = useRoute()

useHead({
  title: app.$i18n.t(localeKey.title.dan['manage-course'].__path__),
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
})

const query = ref({
  keyword: r.query.s?.toString() ?? '',
  page: 0,
  perPage: 10,
  mode: undefined as Mode | undefined,
  ruleset: undefined as Ruleset | undefined,
  rulesetDefaultsToStandard: false,
  allowEmpty: true,
  mania: {
    keyCount: undefined as number | undefined,
  },
})

const { data, refresh, status } = await app.$client.dan.course.managementSearch.useQuery(query)

const pages = computed(() => Math.ceil((data.value?.total || 0) / (query.value.perPage)))

const selectedCourse = ref<any>(null)
const deleteModal = useTemplateRef('deleteModal')

async function validateAndRefresh() {
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

function openDeleteModal(course: any) {
  selectedCourse.value = course
  deleteModal.value?.showModal()
}

async function handleDelete(o: { deleteDans: boolean }) {
  await app.$client.dan.course.delete.mutate({
    id: selectedCourse.value.id,
    deleteDans: o.deleteDans,
  })
  await refresh()
}
</script>

<i18n lang="yaml">
en-GB:
  search-text: Search courses...
  search: Search
  collection: Course
  dan-count: Dan Count
  edit: Edit
  mode: '@:global.mode'
  ruleset: '@:global.ruleset'
  key: Key
  treat-no-ruleset-cond-as-standard: Treat no ruleset condition as standard
  unset: Unset
  create: Create
  creator: Creator
  updater: Updater
  created-at: Created At
  updated-at: Updated At
  actions: Actions

zh-CN:
  search-text: 搜索段位池...
  search: 搜索
  collection: 段位池
  dan-count: 段位数
  edit: 编辑
  mode: '@:global.mode'
  ruleset: '@:global.ruleset'
  key: 键数
  treat-no-ruleset-cond-as-standard: 将无规则集条件视为标准
  unset: 未设置
  create: 创建
  creator: 创建者
  updater: 更新者
  created-at: 创建时间
  updated-at: 更新时间
  actions: 操作
# TODO fr, DE
</i18n>

<template>
  <section class="container px-2 mx-auto custom-container">
    <h1 class="text-2xl font-bold mb-4">
      {{ t('collection') }}
    </h1>

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
          <span class="inline">{{ t('search') }}</span>
          <Icon icon="ion:search-outline" class="w-4 h-4 inline" />
        </button>
      </div>
    </form>

    <div v-if="data" class="relative pt-4 space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gbase-500">found {{ data.total }} results.</span>
        <nuxt-link-locale
          to="/dan/course/new"
          class="btn btn-sm btn-primary"
        >
          <Icon icon="mdi:plus" class="w-4 h-4 mr-1" />
          {{ t('create') }}
        </nuxt-link-locale>
      </div>

      <div class="overflow-x-auto border rounded-lg border-base-300 bg-base-100">
        <table class="table table-sm table-vertical-borders">
          <thead>
            <tr>
              <th class="">
                {{ t('collection') }}
              </th>
              <th class="text-center">
                {{ t('dan-count') }}
              </th>
              <th class="text-center">
                {{ t('creator') }}
              </th>
              <th class="text-center">
                {{ t('updater') }}
              </th>
              <th class="text-center">
                {{ t('created-at') }}
              </th>
              <th class="text-center">
                {{ t('updated-at') }}
              </th>
              <th class="text-center w-0">
                {{ t('actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="course in data.data" :key="course.id">
              <tr class="hover:bg-base-200">
                <th class="align-top">
                  <div class="flex flex-col gap-1">
                    <nuxt-link-locale
                      :to="{
                        name: 'dan-course-detail-id',
                        params: { id: course.id },
                      }"
                      class="font-bold link"
                    >
                      {{ course.name }}
                    </nuxt-link-locale>
                    <div class="text-sm text-base-content/50">
                      {{ course.description }}
                    </div>
                  </div>
                </th>
                <td class="align-top font-mono text-end">
                  {{ course.danCount }}
                </td>
                <td class="align-top text-center">
                  <template v-if="course.creator">
                    <nuxt-link-locale
                      :to="{ name: 'user-handle', params: { handle: `@${course.creator.safeName}` } }"
                      class="link link-primary"
                    >
                      {{ course.creator.name }}
                    </nuxt-link-locale>
                  </template>
                  <template v-else>
                    &mdash;
                  </template>
                </td>
                <td class="align-top text-center">
                  <template v-if="course.updater">
                    <nuxt-link-locale
                      :to="{ name: 'user-handle', params: { handle: `@${course.updater.safeName}` } }"
                      class="link link-primary"
                    >
                      {{ course.updater.name }}
                    </nuxt-link-locale>
                  </template>
                  <template v-else>
                    &mdash;
                  </template>
                </td>
                <td class="align-top text-center">
                  <span class="tooltip" :data-tip="formatDate(course.createdAt, locale)">
                    {{ formatTimeAgo(course.createdAt, locale) }}
                  </span>
                </td>
                <td class="align-top text-center">
                  <span class="tooltip" :data-tip="formatDate(course.updatedAt, locale)">
                    {{ formatTimeAgo(course.updatedAt, locale) }}
                  </span>
                </td>
                <td class="align-top">
                  <div class="flex gap-2">
                    <nuxt-link-locale
                      class="btn btn-xs btn-primary" :to="{
                        name: 'dan-course-detail-id-edit',
                        params: {
                          id: course.id,
                        },
                      }"
                    >
                      <Icon icon="mdi:pencil" class="w-4 h-4" />
                    </nuxt-link-locale>
                    <button class="btn btn-xs btn-error" @click="openDeleteModal(course)">
                      <Icon icon="mdi:delete" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
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
          <template v-for="(_i, n) in pages" :key="`sw-${_i}`">
            <button
              class="join-item btn btn-sm"
              :class="{
                'btn-active': n === query.page,
              }"
              @click="toPage(n)"
            >
              {{ n + 1 }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <dan-course-delete-confirm ref="deleteModal" @confirm="handleDelete" />
  </section>
</template>
