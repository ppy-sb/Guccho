<script setup lang="ts">
import { onBeforeMount, ref, computed, onUnmounted } from 'vue'
import { useAppConfig, useCookie } from '#app'
import { useSession } from '~/store/session'
import { AppConfig } from '~/app.config'

const sessionId = useCookie('session')
const session = useSession()

const props =
  defineProps<{
    disabled?: boolean;
  }>()
const menu = computed(() => [
  {
    name: 'Home',
    route: {
      name: 'index'
    }
  },
  {
    name: 'Leaderboard',
    route: {
      name: 'leaderboard-mode-ruleset-ranking-page'
    }
  },
  {
    name: '[dev] components',
    route: {
      name: 'playground'
    }
  },
  {
    name: 'user(1000)',
    route: {
      name: 'user-handle',
      params: {
        handle: 1000
      }
    }
  }
])
const config = useAppConfig() as AppConfig
const detached = ref(false)
const root = ref<HTMLElement>()
const handleScroll = () => {
  if (!root.value) {
    return
  }

  detached.value = window.pageYOffset > 0
}

const logout = () => {
  session.$reset()
  sessionId.value = ''
  window.location.reload()
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
      :class="[props.disabled && 'disabled']"
    >
      <div class="navbar-start">
        <v-dropdown theme="guweb-dropdown" placement="bottom" :distance="8">
          <label tabindex="0" class="btn btn-ghost btn-circle !shadow-none">
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
                    '!border-primary' : menuItem.route.name === $route.name
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
        <!-- <a class="btn btn-ghost !shadow-none normal-case text-xl">guweb@next</a> -->
        <nuxt-link
          :to="{ name: 'index' }"
          class="btn btn-ghost !shadow-none normal-case text-xl"
        >
          {{ config.title }}
        </nuxt-link>
      </div>
      <div class="hidden gap-2 navbar-center lg:flex">
        <!-- <a class="btn btn-ghost !shadow-none normal-case text-xl">guweb@next</a> -->
        <!-- <nuxt-link :to="{name: 'index'}" class="btn btn-ghost !shadow-none normal-case text-xl">
          guweb@next
        </nuxt-link> -->
        <nuxt-link
          v-for="menuItem in menu"
          :key="`menu-${menuItem.name}`"
          :to="menuItem.route"
          class="btn btn-ghost !shadow-none normal-case attach:text-lg"
        >
          {{ menuItem.name }}
        </nuxt-link>
      </div>
      <div class="navbar-end">
        <v-dropdown theme="guweb-dropdown" placement="left" :distance="8">
          <button class="btn btn-ghost !shadow-none btn-circle">
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
                  <input type="text" placeholder="Search…" class="input input-bordered input-sm shadow-md">
                  <button class="btn btn-sm btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </template>
        </v-dropdown>
        <div class="dropdown dropdown-bottom">
          <button
            v-if="session.$state.loggedIn"
            class="btn btn-ghost !shadow-none btn-circle"
          >
            <div class="indicator avatar">
              <!-- <svg
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg> -->
              <img
                :src="session.$state._data?.avatarUrl"
                class="rounded-full avatar-img ring ring-kimberly-600/70 ring-offset-base-100 ring-offset-2 pointer-events-none"
                alt=""
              >
              <span class="badge badge-xs badge-success indicator-item" />
            </div>
          </button>
          <ul
            tabindex="0"
            class="right-0 p-2 mt-2 shadow-xl menu menu-compact dropdown-content bg-kimberly-100 dark:bg-kimberly-600 rounded-br-2xl rounded-bl-2xl w-52"
          >
            <li>
              <nuxt-link
                :to="{
                  name: 'me-preferences'
                }"
              >
                Preferences
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                :to="{
                  name: 'me-friends'
                }"
              >
                Friends & Blocks
              </nuxt-link>
            </li>
            <li>
              <a href="#" @click="logout">log out</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="postcss">
.detached {
  & .navbar {
    & .btn {
      height: 2.5rem;
      min-height: 2.5rem;
      &.btn-circle {
        width: 2.5rem;
        min-width: 2.5rem;
      }

      &.attach\:text-lg {
        @apply text-base #{!important};
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.navbar-tint {
  @apply bg-kimberly-150/70 dark:bg-kimberly-700/80;
  @apply backdrop-blur-md shadow-xl;
}

.navbar {
  transition: all 0.5s cubic-bezier(0.05, 1, 0.4, 0.95);

  .btn {
    @apply transition-all;
    &.attach\:text-lg {
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
      @apply w-7 #{!important};
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
        @apply w-6 #{!important};
      }
    }
  }
}
</style>
