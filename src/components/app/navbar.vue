<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { useAppConfig } from '#app'
import type { inferProcedureOutput } from '@trpc/server'
import { useDebounceFn } from '@vueuse/core'
import { useSession } from '~/store/session'
import type { AppRouter } from '~~/src/server/trpc/routers'
import { assertIsBanchoBeatmapset } from '~~/src/helpers'

const props
  = defineProps<{
    disabled?: boolean
  }>()
const session = useSession()

const { $client } = useNuxtApp()

const menu = computed(() => [
  {
    name: 'Home',
    route: {
      name: 'index',
    },
  },
  {
    name: 'Leaderboard',
    route: {
      name: 'leaderboard-mode-ruleset-ranking-page',
    },
  },
  {
    name: '[dev] components',
    route: {
      name: 'playground',
    },
  },
  {
    name: 'user(1000)',
    route: {
      name: 'user-handle',
      params: {
        handle: 1000,
      },
    },
  },
  {
    name: 'Beatmapset(1888000)',
    route: {
      name: 'beatmapset-id',
      params: {
        id: 1888000,
      },
    },
  },
])
const config = useAppConfig()
const detached = ref(false)

const root = ref<HTMLElement>()
const searchModal = ref<{
  openModal: () => void
}>()
const shownMenu = reactive({
  left: false,
  right: false,
  user: false,
})
const handleScroll = () => {
  if (root.value == null)
    return

  detached.value = window.pageYOffset > 0
}

const kw = ref<string>('')
const searchResult = ref<inferProcedureOutput<AppRouter['search']['search']>>()

const debouncedSearch = useDebounceFn(async () => {
  if (!kw.value) {
    searchResult.value = undefined
    return
  }
  const result = await $client.search.search.query({ keyword: kw.value })
  searchResult.value = result
}, 300)
const search = () => {
  if (!kw.value) {
    searchResult.value = undefined
    return
  }

  debouncedSearch()
}
const logout = async () => {
  await session.destroy()
  navigateTo('/')
}
onBeforeMount(() => {
  document.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll)
})

const placeholder = (e: Event & { target: HTMLImageElement }) => {
  e.target.src = '/images/image-placeholder.svg'
}
</script>

<template>
  <div
    ref="root"
    class="w-full transition-[padding] fixed navbar-container"
    :class="[detached && 'detached', !disabled && 'z-50']"
  >
    <t-modal-root>
      <t-modal-wrapper
        ref="searchModal"
        v-slot="{ closeModal }"
      >
        <t-modal>
          <template #root>
            <div class="card w-11/12 lg:w-1/2 max-h-[calc(100vh-2em)] bg-gradient-to-b from-base-300 to-base-200 shadow-md">
              <div class="card-actions justify-end pt-2 px-1">
                <button class="btn btn-ghost btn-sm" @click="() => closeModal()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <input
                v-model="kw"
                type="text"
                placeholder="Search User and Beatmaps..."
                class="input input-bordered input-ghost shadow-xl m-4"
                @input="search"
              >
              <div class="pt-0 overflow-auto menus">
                <template v-if="searchResult">
                  <template v-if="searchResult.beatmapsets.length || searchResult.beatmaps.length || searchResult.users.length">
                    <template v-if="searchResult?.beatmapsets.length">
                      <div class="divider">
                        beatmapsets
                      </div>
                      <ul class="menu">
                        <li v-for="bs in searchResult.beatmapsets" :key="`searchResult-bs-${bs.id}`">
                          <nuxt-link
                            :to="{
                              name: 'beatmapset-id',
                              params: {
                                id: bs.id,
                              },
                            }"
                            @click="() => closeModal()"
                          >
                            <div
                              class="drop-shadow-lg flex gap-2 items-center"
                            >
                              <img v-if="assertIsBanchoBeatmapset(bs)" :src="`https://b.ppy.sh/thumb/${bs.foreignId}.jpg`" :onerror="placeholder" class="h-[30px] mask mask-squircle">
                              <span>{{ bs.meta.intl.artist }} - {{ bs.meta.intl.title }}</span>
                            </div>
                          </nuxt-link>
                        </li>
                      </ul>
                    </template>
                    <template v-if="searchResult?.beatmaps.length">
                      <div class="divider w-full">
                        beatmaps
                      </div>
                      <ul class="menu">
                        <li v-for="bm in searchResult.beatmaps" :key="`searchResult-bm-${bm.id}`">
                          <nuxt-link
                            class="py-2"
                            :to="{
                              name: 'beatmapset-id',
                              params: {
                                id: bm.beatmapset.id,
                              },
                            }"
                            @click="() => closeModal()"
                          >
                            <div
                              class="drop-shadow-lg flex gap-2 items-center"
                            >
                              <img v-if="assertIsBanchoBeatmapset(bm.beatmapset)" :src="`https://b.ppy.sh/thumb/${bm.beatmapset.foreignId}.jpg`" class="h-[30px] mask mask-squircle">
                              <span>{{ bm.beatmapset.meta.intl.artist }} - {{ bm.beatmapset.meta.intl.title }} [{{ bm.version }}]</span>
                            </div>
                          </nuxt-link>
                        </li>
                      </ul>
                    </template>
                    <template v-if="searchResult?.users.length">
                      <div class="divider">
                        users
                      </div>
                      <ul class="menu">
                        <li v-for="user in searchResult.users" :key="`searchResult-user-${user.safeName}`">
                          <nuxt-link
                            class="py-2"
                            :to="{
                              name: 'user-handle',
                              params: {
                                handle: `@${user.safeName}`,
                              },
                            }"
                            @click="() => closeModal()"
                          >
                            <div
                              class="drop-shadow-lg flex gap-2 items-center"
                            >
                              <img :src="user.avatarUrl" class="w-[30px] mask mask-squircle" :onerror="placeholder">
                              <span>{{ user.name }}</span>
                            </div>
                          </nuxt-link>
                        </li>
                      </ul>
                    </template>
                  </template>
                  <template v-else>
                    <div class="divider" />
                    <div class="p-5 pt-0">
                      No Result
                    </div>
                  </template>
                </template>
                <template v-else-if="kw">
                  <div class="divider" />
                  <div class="p-5 pt-0">
                    searching "{{ kw }}"...
                  </div>
                </template>
              </div>
            </div>
          </template>
        </t-modal>
      </t-modal-wrapper>
    </t-modal-root>
    <div
      class="navbar navbar-tint transition-[border-radius]"
      :class="[
        props.disabled && 'disabled',
        shownMenu.left && '!rounded-bl-none',
        shownMenu.user && '!rounded-br-none',
      ]"
    >
      <div class="navbar-start">
        <v-dropdown
          v-model:shown="shownMenu.left"
          theme="guweb-dropdown-b"
          placement="bottom"
          :distance="8"
          strategy="fixed"
        >
          <label
            tabindex="0"
            class="btn btn-ghost btn-circle"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <template #popper>
            <div class="menu bg-kimberly-150/70 dark:bg-kimberly-700/80">
              <li
                v-for="menuItem in menu"
                :key="`menu-${menuItem.name}`"
                class="hover-bordered"
              >
                <nuxt-link
                  :to="menuItem.route"
                  :class="{
                    '!border-primary': menuItem.route.name === $route.name,
                  }"
                >
                  {{ menuItem.name }}
                </nuxt-link>
              </li>
            </div>
          </template>
        </v-dropdown>
      </div>
      <div class="navbar-center lg:hidden">
        <nuxt-link
          :to="{ name: 'index' }"
          class="btn btn-ghost normal-case text-xl"
        >
          {{ config.title }}
        </nuxt-link>
      </div>
      <div class="hidden gap-2 navbar-center lg:flex">
        <nuxt-link
          v-for="menuItem in menu"
          :key="`menu-${menuItem.name}`"
          :to="menuItem.route"
          class="btn btn-ghost normal-case attach:text-lg"
        >
          {{ menuItem.name }}
        </nuxt-link>
      </div>
      <div class="navbar-end">
        <button class="btn btn-ghost btn-circle" @click="() => searchModal?.openModal()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <v-dropdown
          v-model:shown="shownMenu.user"
          theme="guweb-dropdown-b"
          placement="bottom"
          :distance="8"
          strategy="fixed"
        >
          <button
            v-if="session.$state.loggedIn"
            class="btn btn-ghost btn-circle"
            @click="shownMenu.user = true"
          >
            <div class="indicator avatar">
              <img
                :src="session.$state.user?.avatarUrl"
                class="rounded-full avatar-img ring ring-kimberly-600/70 ring-offset-base-100 ring-offset-2 pointer-events-none"
                alt=""
              >
              <span class="badge badge-xs badge-success indicator-item" />
            </div>
          </button>
          <template #popper>
            <div class="menu bg-kimberly-150/70 dark:bg-kimberly-700/80">
              <ul
                tabindex="0"
                class="right-0 p-2 mt-2 shadow-xl menu menu-compact dropdown-content rounded-br-2xl rounded-bl-2xl w-52"
              >
                <li>
                  <nuxt-link
                    :to="{
                      name: 'me-settings',
                    }"
                  >
                    Settings
                  </nuxt-link>
                </li>
                <li>
                  <nuxt-link
                    :to="{
                      name: 'me-friends',
                    }"
                  >
                    Friends & Blocks
                  </nuxt-link>
                </li>
                <li>
                  <nuxt-link
                    :to="{
                      name: 'user-handle',
                      params: {
                        handle: session.$state.userId || 0,
                      },
                    }"
                  >
                    My Profile
                  </nuxt-link>
                </li>
                <li class="disabled">
                  <nuxt-link
                    v-if="session.$state.privilege.hasAdminAccess"
                    :to="{
                      name: 'index',
                    }"
                  >
                    Admin Panel
                  </nuxt-link>
                </li>
                <li>
                  <a
                    href="#"
                    @click="logout"
                  >log out</a>
                </li>
              </ul>
            </div>
          </template>
        </v-dropdown>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.navbar {
  @apply border-[1px] border-kimberly-50/0 dark:border-kimberly-500/0;
}
.detached {
  & .navbar {
    @apply  border-kimberly-50/50 dark:border-kimberly-500/50;
    & .btn {
      height: 2.5rem;
      min-height: 2.5rem;

      &.btn-circle {
        width: 2.5rem;
        min-width: 2.5rem;
      }

      &.attach:text-lg {
        @apply text-base !important;
      }
    }
  }
}
</style>

<style lang="postcss" scoped>
.navbar-tint {
  @apply bg-kimberly-150/70 dark:bg-kimberly-700/80;
  @apply backdrop-blur-md shadow-xl;
}

.navbar {
  transition: all 0.5s cubic-bezier(0.05, 1, 0.4, 0.95);

  .btn {
    @apply transition-all;

    &.attach:text-lg {
      @apply text-lg;
    }
  }

  &.disabled {
    transition: all 0.5s cubic-bezier(0.05, 1, 0.4, 0.95);
    filter: saturate(0.8) opacity(0.8) blur(0.2rem);

    * {
      @apply pointer-events-none;
    }
  }

  .avatar {
    & img.avatar-img {
      @apply transition-all;
      @apply w-7 !important;
    }
  }
}

.detached {
  @apply px-2 pt-2;

  & .navbar {
    @apply rounded-2xl;
    @apply min-h-0;

    &.disabled {
      scale: (0.95);
      filter: blur(0.3em);
    }

    .avatar {
      & img.avatar-img {
        @apply transition-all;
        @apply w-6 !important;
      }
    }
  }
}
.menus {
  .menu:last-of-type {
    @apply rounded-b-box
  }
}
</style>
