<script setup lang="ts">
import { useSession } from '~/store/session'

const scrollY = useScrollYObserver()
const { t } = useI18n()
const session = useSession()

const searchModalWrapper = shallowRef<{
  searchModal: {
    showModal: () => void
  }
}>()

const config = useAppConfig()
const detached = shallowRef(false)
watch(scrollY, () => (detached.value = scrollY.value > 0))
const root = shallowRef<HTMLElement>()

const shownMenu = shallowReactive({
  left: false,
  right: false,
  user: false,
})

function clearFocus() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
</script>

<template>
  <app-search-modal ref="searchModalWrapper" />
  <div
    ref="root" class="w-full transition-[padding] sticky p-0 top-0 navbar-container z-40 h-16"
    :class="[detached && 'detached']"
  >
    <div
      class="navbar transition-[border-radius]" :class="[
        shownMenu.left && 'navbar-tint',
        shownMenu.user && 'navbar-tint',
      ]"
    >
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul
            tabindex="0" class="menu menu-tint menu-md dropdown-content mt-3 p-2 w-52" :class="{
              'dropdown-open': shownMenu.left,
            }"
          >
            <app-navbar-navs />
          </ul>
        </div>
        <nuxt-link :to="{ name: 'index' }" class="btn btn-ghost normal-case text-xl hidden lg:flex gap-1">
          <icon name="ion:paw" />
          {{ config.title }}
        </nuxt-link>
        <button
          class="btn btn-ghost btn-circle lg:hidden"
          @click.prevent="() => searchModalWrapper?.searchModal?.showModal()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" size="100%" fill="none" viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu nav-menu menu-horizontal px-1">
          <app-navbar-navs />
        </ul>
      </div>
      <div class="navbar-end">
        <button
          class="btn btn-ghost btn-circle hidden lg:flex"
          @click.prevent="() => searchModalWrapper?.searchModal?.showModal()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" size="100%" fill="none" viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <div v-if="session.loggedIn" class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div class="rounded-full ring ring-gbase-600/70 ring-offset-gbase-100 ring-offset-2 pointer-events-none">
              <img :src="session.$state.user?.avatarSrc" class="avatar-img">
            </div>
          </label>
          <ul
            tabindex="0" class="menu menu-tint menu-md dropdown-content mt-3 p-2 w-52" :class="{
              'dropdown-open': shownMenu.user,
            }"
          >
            <template v-if="session.loggedIn">
              <li>
                <nuxt-link
                  :to="{
                    name: 'me-settings',
                  }" @click="clearFocus"
                >
                  <icon name="solar:settings-bold" class="w-5 h-5" size="100%" />
                  Settings
                </nuxt-link>
              </li>
              <li>
                <nuxt-link
                  :to="{
                    name: 'me-relations',
                  }" @click="clearFocus"
                >
                  <icon name="tabler:circles-relation" class="w-5 h-5" size="100%" />
                  {{ t('titles.relations') }}
                </nuxt-link>
              </li>
              <li>
                <nuxt-link
                  :to="{
                    name: 'user-handle',
                    params: {
                      handle: session.$state.userId || 0,
                    },
                  }" @click="clearFocus"
                >
                  <icon name="mingcute:profile-fill" class="w-5 h-5" size="100%" />
                  {{ t('titles.userpage') }}
                </nuxt-link>
              </li>
              <li v-if="session.$state.privilege.staff">
                <nuxt-link
                  :to="{
                    name: 'admin',
                  }" @click="clearFocus"
                >
                  <icon name="material-symbols:admin-panel-settings-rounded" class="w-5 h-5" size="100%" />
                  {{ t('titles.admin-panel') }}
                </nuxt-link>
              </li>
              <div class="divider my-0" />
              <li>
                <nuxt-link :to="{ name: 'auth-logout' }" @click="clearFocus">
                  <icon name="majesticons:logout-half-circle-line" class="w-5 h-5" size="100%" />
                  {{ t('logout') }}
                </nuxt-link>
              </li>
            </template>
            <template v-else>
              <li>
                <nuxt-link :to="{ name: 'auth-login' }" @click="clearFocus">
                  <icon name="majesticons:login-half-circle-line" class="w-5 h-5" size="100%" />
                  {{ t('login') }}
                </nuxt-link>
              </li>
              <li>
                <nuxt-link :to="{ name: 'auth-register' }" @click="clearFocus">
                  <icon name="mingcute:signature-fill" class="w-5 h-5" size="100%" />
                  {{ t('register') }}
                </nuxt-link>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.navbar-tint,
.detached>.navbar {
  @apply bg-gbase-100/80 dark:bg-gbase-700/80;
  @apply backdrop-blur-md shadow-xl;
  @apply backdrop-saturate-[0.9] backdrop-brightness-[0.95];
  @apply dark:backdrop-saturate-[1] dark:backdrop-brightness-[1];
}

.navbar {
  @apply border-[1px] border-gbase-50/0 dark:border-gbase-500/0;
  transition:all 0.5s cubic-bezier(0.05, 1, 0.4, 0.95);

  & .btn,
  & a,
  & label.dropdown {
    @apply outline-transparent;
    @apply transition-all;
  }

  & ul.nav-menu {
    @apply p-0;
    @apply transition-[padding];
  }

  & .nav-menu li,
  &.btn {
    min-height:3em;
    height:3em;
    @apply outline-transparent;
    @apply transition-all;
  }

  .avatar {
    & .avatar-img {
      @apply object-cover aspect-square;
      @apply transition-all;
      @apply w-8 h-8;
    }
  }

  & .navbar-end {
    @apply transition-[gap];
    @apply gap-0;
  }
}

.detached {
  @apply px-2 pt-1;

  & .navbar {
    @apply border-gbase-50/30 dark:border-gbase-500/30;
    @apply rounded-2xl;
    @apply min-h-0;

    .avatar {
      & .avatar-img {
        @apply transition-all;
        @apply w-5 h-5;
      }
    }

    & .nav-menu li {
      @apply justify-center;
    }

    & .btn,
    & .nav-menu li {
      height:2rem;
      min-height:2rem;
      @apply outline-transparent;
      @apply transition-all;

      &.btn-circle {
        width:2rem;
        min-width:2rem;
        @apply outline-transparent;
        @apply transition-all;
      }

      & a {
        @apply m-0
      }
    }

    & .navbar-end {
      @apply transition-[gap];
      @apply gap-2;
    }
  }
}
</style>

<style lang="postcss" scoped>
.menu-tint {
  @apply shadow rounded-box bg-base-100/80 backdrop-blur-lg;
}

.detached {
  .menu-tint {
    @apply bg-base-100;
  }
}
</style>
