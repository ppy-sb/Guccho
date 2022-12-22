<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref } from 'vue'
import { useAppConfig } from '#app'
import { useSession } from '~/store/session'

const props
  = defineProps<{
    disabled?: boolean
  }>()
const session = useSession()

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
</script>

<template>
  <div
    ref="root"
    class="w-full z-50 transition-[padding] fixed navbar-container"
    :class="[detached && 'detached']"
  >
    <div
      class="navbar navbar-tint transition-[border-radius]"
      :class="[
        props.disabled && 'disabled',
        shownMenu.left && '!rounded-bl-none',
      ]"
    >
      <div class="navbar-start">
        <v-dropdown
          v-model:shown="shownMenu.left"
          theme="guweb-dropdown"
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
        <v-dropdown
          theme="guweb-dropdown"
          placement="left"
          :distance="8"
          strategy="fixed"
        >
          <button class="btn btn-ghost btn-circle">
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
          <template #popper>
            <div class="overflow-hidden">
              <div class="form-control">
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="Search…"
                    class="input input-bordered input-sm shadow-md"
                  >
                  <button class="btn btn-sm btn-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
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
                </div>
              </div>
            </div>
          </template>
        </v-dropdown>
        <v-dropdown
          v-model:shown="shownMenu.user"
          theme="guweb-dropdown"
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
</style>
