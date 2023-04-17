<script setup lang="ts">
import { isBanchoBeatmapset, placeholder } from '~/utils'

const searchModal = shallowRef<{
  openModal: () => void
}>()
defineExpose({
  searchModal,
})

const {
  includes,
  raw,
  onInput,
  mode,
  keyword,
  tags,
  results: {
    beatmaps,
    beatmapsets,
    users,
  },
  loading,
  nothing,
} = await useSearchModal()
</script>

<template>
  <t-modal-root>
    <t-modal-wrapper ref="searchModal" v-slot="{ closeModal }">
      <div class="flex w-full justify-center pt-[1em]">
        <div
          class="card w-11/12 lg:w-2/3 max-h-[calc(100vh-2em)]"
        >
          <div class="card-actions pt-2 px-1 flex">
            <div class="pl-3" />
            <div class="flex flex-col gap-4 md:flex-row items-baseline pt-1">
              <div class="form-control">
                <label class="label cursor-pointer p-0 flex gap-2">
                  <input
                    v-model="includes.beatmapsets" type="checkbox" class="checkbox checkbox-sm" @change="() => {
                      includes.users = !includes.beatmaps && !includes.beatmapsets
                      raw(true)
                    }"
                  >
                  <span class="label-text">Include beatmapsets</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer p-0 flex gap-2">
                  <input
                    v-model="includes.beatmaps" type="checkbox" class="checkbox checkbox-sm" @change="() => {
                      includes.users = !includes.beatmaps && !includes.beatmapsets
                      raw(true)
                    }"
                  >
                  <span class="label-text">Include beatmaps</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer p-0 flex gap-2">
                  <input
                    v-model="includes.users" type="checkbox" class="checkbox checkbox-sm" @change="() => {
                      includes.beatmaps = !includes.users
                      includes.beatmapsets = !includes.users
                      raw(false)
                    }"
                  >
                  <span class="label-text">Include users</span>
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
          <div class="mx-4 bg-gbase-50 dark:bg-gbase-800 shadow-2xl rounded-2xl h-max overflow-hidden">
            <div class="form-control">
              <label v-if="mode === 'beatmap'" class="input-group">
                <span class="flex gap-2 bg-transparent">
                  <span v-if="!tags.length" class="opacity-50 bg-transparent">Tags</span>
                  <span v-for="tag, index in tags" :key="index" class="badge badge-md badge-primary gap-1 cursor-pointer whitespace-nowrap" @click="tags.splice(index, 1)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    <div v-html="tag.toString()" />
                  </span>
                </span>
                <input
                  v-model="keyword"
                  type="text"
                  placeholder="Search User and Beatmaps..."
                  class="input grow border-label-0 focus:input-primary bg-transparent !outline-0"
                  @input="onInput"
                  @keyup.enter="raw(true)"
                >
              </label>
              <input
                v-else
                v-model="keyword"
                type="text"
                placeholder="Search User and Beatmaps..."
                class="input grow border-label-0 focus:input-primary bg-transparent !outline-0"
                @input="onInput"
                @keyup.enter="raw(true)"
              >
            </div>
            <div class="pt-0 h-full overflow-auto menus">
              <template v-if="loading.beatmapsets">
                <div class="divider" />
                <div class="p-5 pt-0">
                  Finding beatmapsets...
                </div>
              </template>
              <template
                v-else-if="Array.isArray(beatmapsets) && beatmapsets.length"
              >
                <div class="divider font-bold">
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
              <template v-if="loading.beatmaps">
                <div class="divider" />
                <div class="p-5 pt-0">
                  Finding beatmaps...
                </div>
              </template>
              <template v-else-if="Array.isArray(beatmaps) && beatmaps.length">
                <div class="divider font-bold">
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
              <template v-if="loading.users">
                <div class="divider" />
                <div class="p-5 pt-0">
                  Finding users...
                </div>
              </template>
              <template v-else-if="Array.isArray(users) && users.length">
                <div class="divider font-bold">
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
              <template v-if="nothing">
                <div class="divider" />
                <div class="p-5 pt-0">
                  Found nothing.
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </t-modal-wrapper>
  </t-modal-root>
</template>

<style scoped></style>
