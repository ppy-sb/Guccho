<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { modes } from '~/types/defs'
import type { Mode } from '~/types/common'
import { isBanchoBeatmapset, placeholder } from '~/utils'
import type { OP, Tag } from '~/types/search'

const app = useNuxtApp()
const searchModal = ref<{
  openModal: () => void
}>()
const kw = ref('')
const lastKw = ref('')

const tags = ref<Tag[]>([])

const taggable = {
  mode: modes,
}
const tagOperators = {
  eq: '=',
  ne: '!=',
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
const compareOperators: Record<OP, string> = {
  eq: '=',
  ne: '!=',
  lte: '<',
  lt: '<=',
  gte: '>=',
  gt: '>',
}
const tag = <T extends keyof typeof taggable, K extends (typeof taggable)[T][number]>
  (key: T, op: keyof typeof tagOperators, value: K) => {
  const _v = [key, op, value] as [T, typeof op, K]
  _v.toString = () => `<b>${key}</b> ${tagOperators[op]} <b>${value}</b>`
  return _v
}
const query = <T extends keyof typeof queryable, K>(key: T, op: keyof typeof compareOperators, value: K) => {
  const _v = [key, op, value] as [T, OP, K]
  _v.toString = () => `<b>${key}</b> ${compareOperators[op]} <b>${value}</b>`
  return _v
}

const extractTags = (force: boolean) => {
  // user input space to confirm tag
  if (!force && !kw.value.endsWith(' ')) {
    return
  }

  const tokens = kw.value.split(' ')
  // with side effects
  kw.value = tokens.filter((token) => {
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
  if (!force && !kw.value.endsWith(' ')) {
    return
  }
  const tokens = kw.value.split(' ')
  kw.value = tokens.filter((token) => {
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

defineExpose({
  searchModal,
})

const includes = reactive({
  beatmaps: true,
  beatmapsets: true,
  users: true,
})

const {
  data: users,
  pending: pendingUsers,
  refresh: searchUsers,
} = await useAsyncData(async () => {
  if (!kw.value) {
    return []
  }
  return await app.$client.search.searchUser.query({
    keyword: kw.value,
    limit: 10,
  })
})

const {
  data: beatmaps,
  pending: pendingBeatmaps,
  refresh: searchBeatmaps,
} = await useAsyncData(async () => {
  if (!kw.value && !tags.value.length) {
    return []
  }
  return await app.$client.search.searchBeatmap.query({
    keyword: kw.value,
    filters: tags.value,
    limit: 10,
  })
})

const {
  data: beatmapsets,
  pending: pendingBeatmapsets,
  refresh: searchBeatmapsets,
} = await useAsyncData(async () => {
  if (!kw.value && !tags.value.length) {
    return []
  }
  return await app.$client.search.searchBeatmapset.query({
    keyword: kw.value,
    filters: tags.value,
    limit: 10,
  })
})

const searchMode = computed(() => (includes.beatmaps || includes.beatmapsets) && !includes.users ? 'beatmap' : 'all')
const extract = (force = false) => {
  if (searchMode.value === 'beatmap') {
    extractTags(force)
    extractQueries(force)
  }
}

const searchRaw = (_extract = false) => {
  _extract && extract(true)

  if (tags.value.length < 1) {
    if (!kw.value) {
      beatmaps.value = []
      beatmapsets.value = []
      users.value = []
    }
    if (kw.value === lastKw.value) {
      return
    }
  }

  includes.users ? searchUsers() : users.value = []
  includes.beatmaps ? searchBeatmaps() : beatmaps.value = []
  includes.beatmapsets ? searchBeatmapsets() : beatmapsets.value = []
}

const search = useDebounceFn(searchRaw, 500)

const searchTrigger = () => {
  extract()
  search(false)
}
const hasResult = computed(() => {
  return (
    (Array.isArray(beatmapsets.value) && beatmapsets.value.length)
    || (Array.isArray(beatmaps.value) && beatmaps.value.length)
    || (Array.isArray(users.value) && users.value.length)
  )
})
watch(tags, () => searchRaw(), { deep: true })
</script>

<template>
  <t-modal-root>
    <t-modal-wrapper ref="searchModal" v-slot="{ closeModal }">
      <t-modal>
        <template #root>
          <div
            class="card w-11/12 lg:w-2/3 max-h-[calc(100vh-2em)] bg-gradient-to-b from-kimberly-100 to-kimberly-200 dark:from-base-300 dark:to-base-200 shadow-lg"
          >
            <div class="card-actions pt-2 px-1 flex">
              <div class="pl-3" />
              <div class="flex flex-col gap-4 md:flex-row items-baseline pt-1">
                <div class="form-control">
                  <label class="label cursor-pointer p-0 flex gap-2">
                    <input
                      v-model="includes.beatmapsets" type="checkbox" class="checkbox checkbox-sm" @change="() => {
                        includes.users = !includes.beatmaps && !includes.beatmapsets
                        searchRaw(true)
                      }"
                    >
                    <span class="label-text">Includes Beatmapsets</span>
                  </label>
                </div>
                <div class="form-control">
                  <label class="label cursor-pointer p-0 flex gap-2">
                    <input
                      v-model="includes.beatmaps" type="checkbox" class="checkbox checkbox-sm" @change="() => {
                        includes.users = !includes.beatmaps && !includes.beatmapsets
                        searchRaw(true)
                      }"
                    >
                    <span class="label-text">Includes Beatmaps</span>
                  </label>
                </div>
                <div class="form-control">
                  <label class="label cursor-pointer p-0 flex gap-2">
                    <input
                      v-model="includes.users" type="checkbox" class="checkbox checkbox-sm" @change="() => {
                        includes.beatmaps = !includes.users
                        includes.beatmapsets = !includes.users
                        searchRaw(false)
                      }"
                    >
                    <span class="label-text">Includes Users</span>
                  </label>
                </div>
              </div>
              <div class="ml-auto" />
              <button class="btn btn-ghost btn-sm" @click="() => closeModal()">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="form-control m-4">
              <label v-if="searchMode === 'beatmap'" class="input-group">
                <span class="shadow-md flex gap-2">
                  <span v-if="!tags.length" class="opacity-50">Search</span>
                  <span v-for="tag, index in tags" :key="index" class="badge badge-md badge-primary gap-1 cursor-pointer whitespace-nowrap" @click="tags.splice(index, 1)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <div v-html="tag.toString()" />
                  </span>
                </span>
                <input
                  v-model="kw"
                  type="text"
                  placeholder="Search User and Beatmaps..."
                  class="input grow input-bordered border-label-0 input-ghost shadow-md"
                  @input="searchTrigger"
                  @keyup.enter="searchRaw(true)"
                >
              </label>
              <input
                v-else
                v-model="kw"
                type="text"
                placeholder="Search User and Beatmaps..."
                class="input grow input-bordered border-label-0 input-ghost shadow-md"
                @input="searchTrigger"
                @keyup.enter="searchRaw(true)"
              >
            </div>

            <div class="pt-0 overflow-auto menus">
              <template
                v-if="
                  pendingBeatmaps || pendingBeatmapsets || pendingUsers
                "
              >
                <div class="divider" />
                <div class="p-5 pt-0">
                  searching...
                </div>
              </template>
              <template v-else-if="hasResult">
                <template
                  v-if="Array.isArray(beatmapsets) && beatmapsets.length"
                >
                  <div class="divider">
                    beatmapsets
                  </div>
                  <ul class="menu">
                    <li
                      v-for="bs in beatmapsets"
                      :key="`searchResult-bs-${bs.id}`"
                    >
                      <nuxt-link
                        :to="{
                          name: 'beatmapset-id',
                          params: {
                            id: bs.id,
                          },
                        }"
                        @click="() => closeModal()"
                      >
                        <div class="flex gap-2 items-center">
                          <img
                            v-if="isBanchoBeatmapset(bs)"
                            class="h-[30px] mask mask-squircle overflow-hidden object-cover aspect-square"
                            :src="`https://b.ppy.sh/thumb/${bs.foreignId}.jpg`"
                            :onerror="placeholder"
                          >
                          <span>{{ bs.meta.intl.artist }} -
                            {{ bs.meta.intl.title }}</span>
                        </div>
                      </nuxt-link>
                    </li>
                  </ul>
                </template>
                <template v-if="Array.isArray(beatmaps) && beatmaps.length">
                  <div class="divider w-full">
                    beatmaps
                  </div>
                  <ul class="menu">
                    <li
                      v-for="bm in beatmaps"
                      :key="`searchResult-bm-${bm.id}`"
                    >
                      <nuxt-link
                        :to="{
                          name: 'beatmapset-id',
                          params: {
                            id: bm.beatmapset.id,
                          },
                        }"
                        @click="() => closeModal()"
                      >
                        <div class="flex gap-2 items-center">
                          <img
                            v-if="isBanchoBeatmapset(bm.beatmapset)"
                            class="h-[30px] mask mask-squircle overflow-hidden object-cover aspect-square"
                            :src="`https://b.ppy.sh/thumb/${bm.beatmapset.foreignId}.jpg`"
                            :onerror="placeholder"
                          >
                          <span>{{ bm.beatmapset.meta.intl.artist }} -
                            {{ bm.beatmapset.meta.intl.title }} [{{
                              bm.version
                            }}]</span>
                        </div>
                      </nuxt-link>
                    </li>
                  </ul>
                </template>
                <template v-if="Array.isArray(users) && users.length">
                  <div class="divider">
                    users
                  </div>
                  <ul class="menu">
                    <li
                      v-for="user in users"
                      :key="`searchResult-user-${user.safeName}`"
                    >
                      <nuxt-link
                        :to="{
                          name: 'user-handle',
                          params: {
                            handle: `@{user.safeName}`,
                          },
                        }"
                        @click="() => closeModal()"
                      >
                        <div class="flex gap-2 items-center">
                          <img
                            :src="user.avatarSrc"
                            class="w-[30px] mask mask-squircle overflow"
                            :onerror="placeholder"
                          >
                          <span>{{ user.name }}</span>
                        </div>
                      </nuxt-link>
                    </li>
                  </ul>
                </template>
              </template>
              <template v-else-if="kw">
                <div class="divider" />
                <div class="p-5 pt-0">
                  No Result
                </div>
              </template>
            </div>
          </div>
        </template>
      </t-modal>
    </t-modal-wrapper>
  </t-modal-root>
</template>

<style scoped></style>
