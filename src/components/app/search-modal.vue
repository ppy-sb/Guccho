<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { assertIsBanchoBeatmapset, placeholder } from '~/utils'

const { $client } = useNuxtApp()
const searchModal = ref<{
  openModal: () => void
}>()
const kw = ref<string>('')

defineExpose({
  searchModal,
})

const {
  data: users,
  pending: pendingUsers,
  refresh: searchUsers,
} = await useAsyncData(async () => {
  if (!kw.value) {
    return []
  }
  return await $client.search.searchUser.query({
    keyword: kw.value,
    limit: 10,
  })
})

const {
  data: beatmaps,
  pending: pendingBeatmaps,
  refresh: searchBeatmaps,
} = await useAsyncData(async () => {
  if (!kw.value) {
    return []
  }
  return await $client.search.searchBeatmap.query({
    keyword: kw.value,
    limit: 10,
  })
})

const {
  data: beatmapsets,
  pending: pendingBeatmapsets,
  refresh: searchBeatmapsets,
} = await useAsyncData(async () => {
  if (!kw.value) {
    return
  }
  return await $client.search.searchBeatmapset.query({
    keyword: kw.value,
    limit: 10,
  })
})

const search = useDebounceFn(() => {
  if (!kw.value) {
    return
  }

  searchUsers()
  searchBeatmaps()
  searchBeatmapsets()
}, 300)
const hasResult = computed(() => {
  return (
    (Array.isArray(beatmapsets.value) && beatmapsets.value.length)
    || (Array.isArray(beatmaps.value) && beatmaps.value.length)
    || (Array.isArray(users.value) && users.value.length)
  )
})
</script>

<template>
  <t-modal-root>
    <t-modal-wrapper ref="searchModal" v-slot="{ closeModal }">
      <t-modal>
        <template #root>
          <div
            class="card w-11/12 lg:w-2/3 max-h-[calc(100vh-2em)] bg-gradient-to-b from-kimberly-100 to-kimberly-200 dark:from-base-300 dark:to-base-200 shadow-lg"
          >
            <div class="card-actions justify-end pt-2 px-1">
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
            <input
              v-model="kw"
              type="text"
              placeholder="Search User and Beatmaps..."
              class="input input-bordered input-ghost shadow-md m-4"
              @input="search"
            >
            <div class="pt-0 overflow-auto menus">
              <template
                v-if="
                  pendingBeatmaps && pendingBeatmapsets && pendingUsers && kw
                "
              >
                <div class="divider" />
                <div class="p-5 pt-0">
                  searching "{{ kw }}"...
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
                        <div class="drop-shadow-lg flex gap-2 items-center">
                          <img
                            v-if="assertIsBanchoBeatmapset(bs)"
                            class="h-[30px] mask mask-squircle"
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
                        <div class="drop-shadow-lg flex gap-2 items-center">
                          <img
                            v-if="assertIsBanchoBeatmapset(bm.beatmapset)"
                            class="h-[30px] mask mask-squircle"
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
                            handle: `@${user.safeName}`,
                          },
                        }"
                        @click="() => closeModal()"
                      >
                        <div class="drop-shadow-lg flex gap-2 items-center">
                          <img
                            :src="user.avatarSrc"
                            class="w-[30px] mask mask-squircle"
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
