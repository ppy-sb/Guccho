<script setup lang="ts">
import {
  faAddressCard,
  faBriefcase,
  faHeartCrack,
  faParagraph,
  faPaw,
  faRightFromBracket,
  faRightToBracket,
  faSignature,
  faSliders,
} from '@fortawesome/free-solid-svg-icons'
import { useSession } from '~/store/session'

const props = defineProps<{
  disabled?: boolean
}>()

const { addToLibrary } = useFAIcon()
addToLibrary(
  faAddressCard,
  faBriefcase,
  faHeartCrack,
  faParagraph,
  faRightFromBracket,
  faRightToBracket,
  faSignature,
  faSliders,
  faPaw
)

const [scrollY] = useScrollYObserver()

const session = useSession()
// const $route = useRoute()

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
    ref="root"
    class="w-full transition-[padding] fixed navbar-container z-40"
    :class="[detached && 'detached']"
  >
    <div
      class="navbar transition-[border-radius]"
      :class="[
        props.disabled && 'disabled',
        shownMenu.left && 'navbar-tint',
        shownMenu.user && 'navbar-tint',
      ]"
    >
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabindex="0"
            class="menu menu-tint menu-compact dropdown-content mt-3 p-2 w-52"
            :class="{
              'dropdown-open': shownMenu.left,
            }"
          >
            <app-navbar-navs
              @search="() => searchModalWrapper?.searchModal?.showModal()"
            />
          </ul>
        </div>
        <nuxt-link
          :to="{ name: 'index' }"
          class="btn btn-ghost normal-case text-xl hidden lg:flex gap-1"
        >
          <FontAwesomeIcon icon="fa-solid fa-paw" class="w-4" />
          {{ config.title }}
        </nuxt-link>
        <button
          class="btn btn-ghost btn-circle lg:hidden"
          @click.prevent="() => searchModalWrapper?.searchModal?.showModal()"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu nav-menu menu-horizontal px-1">
          <app-navbar-navs
            @search="() => searchModalWrapper?.searchModal?.showModal()"
          />
        </ul>
      </div>
      <div class="navbar-end">
        <button
          class="btn btn-ghost btn-circle hidden lg:flex"
          @click.prevent="() => searchModalWrapper?.searchModal?.showModal()"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <div v-if="session.loggedIn" class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div
              class="rounded-full ring ring-gbase-600/70 ring-offset-gbase-100 ring-offset-2 pointer-events-none"
            >
              <img :src="session.$state.user?.avatarSrc" class="avatar-img">
            </div>
          </label>
          <ul
            tabindex="0"
            class="menu menu-tint menu-compact dropdown-content mt-3 p-2 w-52"
            :class="{
              'dropdown-open': shownMenu.user,
            }"
          >
            <template v-if="session.loggedIn">
              <li>
                <nuxt-link
                  :to="{
                    name: 'me-settings',
                  }"
                  @click="clearFocus"
                >
                  <FontAwesomeIcon icon="fa-solid fa-sliders" class="w-5" />
                  Settings
                </nuxt-link>
              </li>
              <li>
                <nuxt-link
                  :to="{
                    name: 'me-relations',
                  }"
                  @click="clearFocus"
                >
                  <FontAwesomeIcon icon="fa-solid fa-heart-crack" class="w-5" />
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
                  @click="clearFocus"
                >
                  <FontAwesomeIcon
                    icon="fa-solid fa-address-card"
                    class="w-5"
                  />
                  My Profile
                </nuxt-link>
              </li>
              <li v-if="session.$state.privilege.staff">
                <nuxt-link
                  :to="{
                    name: 'admin',
                  }"
                  @click="clearFocus"
                >
                  <FontAwesomeIcon icon="fa-solid fa-briefcase" class="w-5" />
                  Admin Panel
                </nuxt-link>
              </li>
              <div class="divider my-0" />
              <li>
                <nuxt-link :to="{ name: 'auth-logout' }" @click="clearFocus">
                  <FontAwesomeIcon
                    icon="fa-solid fa-right-from-bracket"
                    class="w-5"
                  />
                  Sign out
                </nuxt-link>
              </li>
            </template>
            <template v-else>
              <li>
                <nuxt-link :to="{ name: 'auth-login' }" @click="clearFocus">
                  <FontAwesomeIcon
                    icon="fa-solid fa-right-to-bracket"
                    class="w-5"
                  />
                  Sign in
                </nuxt-link>
              </li>
              <li>
                <nuxt-link :to="{ name: 'auth-register' }" @click="clearFocus">
                  <FontAwesomeIcon icon="fa-solid fa-signature" class="w-5" />
                  Sign up
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
.detached > .navbar {
  @apply bg-gbase-100/80 dark:bg-gbase-700/80;
  @apply backdrop-blur-md shadow-xl;
  @apply backdrop-saturate-[0.9] backdrop-brightness-[0.95];
  @apply dark:backdrop-saturate-[1] dark:backdrop-brightness-[1];
}
.navbar {
  @apply border-[1px] border-gbase-50/0 dark:border-gbase-500/0;
  transition: all 0.5s cubic-bezier(0.05, 1, 0.4, 0.95);

  & .btn,
  & a,
  & label.dropdown {
    @apply transition-all;
  }

  & .nav-menu li a,
  &.btn {
    min-height: 3em;
    height: 3em;
    @apply transition-all;
  }

  &.attach:text-lg {
    @apply text-lg;
  }

  &.disabled {
    * {
      @apply pointer-events-none;
    }
  }

  .avatar {
    & .avatar-img {
      @apply object-cover aspect-square;
      @apply transition-all;
      @apply w-8;
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
        @apply w-5;
      }
    }
    & .btn,
    & .nav-menu li a {
      height: 2rem;
      min-height: 2rem;
      @apply transition-all;

      &.btn-circle {
        width: 2rem;
        min-width: 2rem;
      }

      &.attach:text-lg {
        @apply text-base !important;
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
/* .menus {
  .menu:last-of-type {
    @apply rounded-b-box;
  }
} */
.menu-tint {
  @apply shadow rounded-box bg-base-100/80 backdrop-blur-lg;
}
.detached {
  .menu-tint {
    @apply bg-base-100;
  }
}
</style>
