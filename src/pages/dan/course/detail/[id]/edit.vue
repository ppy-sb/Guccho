<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Mode, Ruleset } from '~/def'
import useAdapterConfig from '~/composables/useAdapterConfig'

definePageMeta({
  middleware: ['auth', 'staff'],
})

const { t } = useI18n()
const route = useRoute('dan-course-detail-id-edit')
const router = useRouter()
const app = useNuxtApp()
const server = useAdapterConfig()

let course = await app.$client.dan.course.get.query(route.params.id)
const localCourse = ref(structuredClone(course))

const danQuery = ref({
  keyword: '',
  page: 0,
  perPage: 10,
  mode: undefined as Mode | undefined,
  ruleset: undefined as Ruleset | undefined,
  rulesetDefaultsToStandard: false,
  mania: {
    keyCount: undefined as number | undefined,
  },
  excludeDans: undefined as string[] | undefined,
  danglingOnly: undefined as boolean | undefined,
})
const { data: danSearchResults, refresh: _refreshDanSearch, status: danSearchStatus } = await app.$client.dan.course.searchDan.useQuery(danQuery)

const deleteModal = useTemplateRef('deleteModal')

const pages = computed(() => Math.ceil((danSearchResults.value?.total || 0) / (danQuery.value.perPage)))

function init(result: typeof course) {
  course = structuredClone(result)
  localCourse.value = structuredClone(course)
}

function handleCancel() {
  router.push('/dan/course/manage')
}

async function handleDelete(o: { deleteDans: boolean }) {
  await app.$client.dan.course.delete.mutate({
    id: course.id,
    deleteDans: o.deleteDans,
  })
}

function addDanToCourse(dan: any) {
  if (localCourse.value.dans.some(i => i.id === dan.id)) {
    return
  }
  localCourse.value.dans = [...(localCourse.value.dans || []), { ...dan }]
}

function removeDanFromCourse(dan: any) {
  localCourse.value.dans = localCourse.value.dans.filter(d => d.id !== dan.id)
}

async function saveChanges() {
  const result = await app.$client.dan.course.update.mutate({
    id: course.id,
    name: localCourse.value.name,
    description: localCourse.value.description,
    dans: localCourse.value.dans.map(dan => ({
      id: dan.id,
      shortName: dan.shortName,
    })),
  })
  init(result)
}

async function refreshDanSearch() {
  danQuery.value.excludeDans = localCourse.value.dans.map(i => i.id)
  await _refreshDanSearch()
}

function handleDanSearch() {
  danQuery.value.page = 0
  refreshDanSearch()
}

function handleDanSearchControlChange() {
  danQuery.value.page = 0
  refreshDanSearch()
}

function toDanPage(n: number) {
  danQuery.value.page = n
  _refreshDanSearch()
}

function isDanInCourse(dan: any) {
  return localCourse.value.dans.some(i => i.id === dan.id)
}
</script>

<i18n lang="yaml">
en-GB:
  search-text: Search dans...
  search: Search
  dan: Dan
  delete: Delete
  confirm-delete: Are you sure you want to delete this course?
  cancel: Cancel
  save: Save
  name: Name
  add-dan: Add Dan
  remove-dan: Remove Dan
  no-dans: No dans found
  actions: Actions
  description: Description
  requirements: Requirements
  full-name: FQDN (fully qualified dan name)
  create: Create Course
  back: Back
  mode: Mode
  unset: Unset
  treat-no-ruleset-cond-as-standard: Treat No Ruleset Condition as Standard
  dangling-only: Only Dangling
  delete-dans: Delete dans in course

zh-CN:
  search-text: 搜索段位...
  search: 搜索
  dan: 段位
  delete: 删除
  confirm-delete: 确定要删除这个段位池吗？
  cancel: 取消
  save: 保存
  name: 名称
  add-dan: 添加段位
  remove-dan: 移除段位
  no-dans: 未找到段位
  actions: 操作
  description: 描述
  requirements: 要求
  full-name: 全名
  create: 创建段位池
  back: 返回
  mode: 模式
  unset: 未设置
  treat-no-ruleset-cond-as-standard: 将无规则条件视为标准
  dangling-only: 仅显示未入池
  delete-dans: 删除池中的段位

# TODO fr, DE
</i18n>

<template>
  <section class="container px-2 mx-auto custom-container">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-4">
        <button class="btn btn-ghost" @click="handleCancel">
          <Icon icon="mdi:arrow-left" class="w-4 h-4" />
          {{ t('back') }}
        </button>
      </div>

      <button class="btn btn-error" @click="deleteModal?.showModal()">
        <Icon icon="mdi:delete" class="w-5 h-5" />
      </button>
    </div>

    <dan-course-form-header
      :id="route.params.id"
      v-model:title.lazy="localCourse.name"
      v-model:description.lazy="localCourse.description"
      :created-at="localCourse.createdAt"
      :creator="localCourse.creator"
      :updated-at="localCourse.updatedAt"
      :updater="localCourse.updater"
    />

    <div class="space-y-4">
      <div class="border rounded-lg border-base-300 overflow-hidden">
        <form class="p-2 bg-base-200 rounded-t-md" @submit.prevent="handleDanSearch">
          <div class="grid grid-cols-4 pb-2 space-x-2 gap-y-2 lg:grid-cols-12">
            <div class="col-span-2 form-control">
              <div class="label">
                <span class="label-text">{{ t('mode') }}</span>
              </div>
              <select v-model="danQuery.mode" class="select select-sm select-bordered" @change="handleDanSearchControlChange">
                <option :value="undefined">
                  {{ t('unset') }}
                </option>
                <option v-for="mode in Object.values(Mode)" :key="mode" :value="mode">
                  {{ t(localeKey.root.mode[mode].__path__) }}
                </option>
              </select>
            </div>
            <div class="col-span-2 form-control">
              <div class="label">
                <span class="label-text">{{ t('ruleset') }}</span>
              </div>
              <select v-model="danQuery.ruleset" class="select select-sm select-bordered" @change="handleDanSearchControlChange">
                <option :value="undefined">
                  {{ t('unset') }}
                </option>
                <option v-for="ruleset in Object.values(Ruleset)" :key="ruleset" :value="ruleset" :disabled="danQuery.mode ? !server.hasRuleset(danQuery.mode, ruleset) : false">
                  {{ t(localeKey.root.ruleset[ruleset].__path__) }}
                </option>
              </select>
            </div>
            <div v-show="danQuery.mode === Mode.Mania" class="col-span-2 form-control">
              <div class="label">
                <span class="label-text">{{ t('key') }}</span>
              </div>
              <select v-model="danQuery.mania.keyCount" class="select select-sm select-bordered" @change="handleDanSearchControlChange">
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
                <input v-model.lazy="danQuery.rulesetDefaultsToStandard" type="checkbox" class="toggle" @change="handleDanSearchControlChange">
              </label>
            </div>
            <div class="justify-end col-span-6 md:col-span-4 form-control">
              <label class="justify-start gap-2 cursor-pointer label">
                <span class="label-text">{{ t('dangling-only') }}</span>
                <input v-model.lazy="danQuery.danglingOnly" type="checkbox" class="toggle" @change="() => handleDanSearchControlChange()">
              </label>
            </div>
          </div>
          <label for="keyword" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">{{ t('search') }}</label>
          <div class="flex gap-2">
            <div class="form-control grow">
              <input id="keyword" v-model.lazy="danQuery.keyword" name="keyword" type="search" class="input input-sm input-bordered" :placeholder="t('search-text')">
            </div>
            <button class="btn btn-sm btn-primary">
              <Icon icon="ion:search-outline" class="w-4 h-4" />
            </button>
          </div>
        </form>
        <div v-if="danSearchResults?.data?.length" class="bg-base-100 resize-y overflow-auto min-h-0 max-h-max">
          <table class="table table-sm table-pin-rows">
            <thead>
              <tr>
                <th />
                <th>{{ t('full-name') }}</th>
                <th>{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="dan in danSearchResults.data" :key="dan.id">
                <tr class="hover:bg-base-200 css-expand">
                  <td class="w-0">
                    <label class="swap swap-rotate">
                      <input type="checkbox">
                      <svg
                        class="fill-current swap-off"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                      </svg>
                      <svg
                        class="fill-current swap-on"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                      </svg>
                    </label>
                  </td>
                  <td>
                    <div class="whitespace-pre">
                      <nuxt-link-locale
                        :to="{ name: 'dan-detail-id', params: { id: dan.id } }"
                        class="font-bold link"
                      >
                        {{ dan.name }}
                      </nuxt-link-locale>
                    </div>
                  </td>
                  <td>
                    <button v-if="!isDanInCourse(dan)" class="btn btn-sm btn-primary" @click="addDanToCourse(dan)">
                      <span class="sr-only">{{ t('add-dan') }}</span>
                      <Icon icon="mdi:plus" class="w-4 h-4" />
                    </button>
                    <button v-else class="btn btn-sm btn-error" @click="removeDanFromCourse(dan)">
                      <span class="sr-only">{{ t('remove-dan') }}</span>
                      <Icon icon="mdi:minus" class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr class="hidden css-expand-content">
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
            </tbody>
          </table>
        </div>
        <div v-else-if="danQuery.keyword && danSearchStatus !== 'pending'" class="text-center py-2 text-sm text-base-content/50">
          {{ t('no-dans') }}
        </div>
      </div>
      <div v-if="pages > 1" class="flex">
        <div class="mx-auto join">
          <template v-for="(i, n) in pages" :key="`danpage${i}`">
            <button
              v-if="n === 0" class="join-item btn"
              :class="{ 'btn-active': n === danQuery.page }"
              @click="toDanPage(n)"
            >
              {{ Math.abs(n - danQuery.page) > 3 && '|<' || '' }} {{ i }}
            </button>
            <button
              v-else-if="Math.abs(n - danQuery.page) <= 3"
              class="join-item btn"
              :class="{ 'btn-active': n === danQuery.page }"
              @click="toDanPage(n)"
            >
              {{ i }}
            </button>
            <button
              v-else-if="i === pages" class="join-item btn"
              :class="{ 'btn-active': n === danQuery.page }"
              @click="toDanPage(n)"
            >
              {{ i }} >|
            </button>
          </template>
        </div>
      </div>

      <div class="overflow-x-auto border rounded-lg border-base-300 bg-base-100">
        <table class="table table-sm">
          <thead>
            <tr>
              <th />
              <th>{{ t('dan') }}</th>
              <th>{{ t('full-name') }}</th>
              <th>{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="dan in localCourse.dans" :key="dan.id">
              <tr class="hover:bg-base-200 css-expand">
                <td class="w-0">
                  <label class="swap swap-rotate">
                    <input type="checkbox">
                    <svg
                      class="fill-current swap-off"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                    </svg>
                    <svg
                      class="fill-current swap-on"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                  </label>
                </td>
                <th class="align-top">
                  <input
                    v-model.lazy="dan.shortName"
                    type="text"
                    class="input input-bordered input-sm w-24"
                  >
                </th>
                <td class="align-top">
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
                <td class="align-top">
                  <button class="btn btn-sm btn-error" @click="removeDanFromCourse(dan)">
                    <span class="sr-only">{{ t('remove-dan') }}</span>
                    <Icon icon="mdi:delete" class="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr class="hidden css-expand-content">
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
          </tbody>
        </table>
      </div>

      <div class="flex justify-end">
        <button class="btn btn-primary" @click="saveChanges">
          {{ t('save') }}
        </button>
      </div>
    </div>

    <dan-course-delete-confirm ref="deleteModal" @confirm="handleDelete" />
  </section>
</template>

<style lang="postcss">
.css-expand {
  &:has(td input:checked) + .css-expand-content {
    @apply table-row
  }
}
</style>
