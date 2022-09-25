<template>
  <nav class="z-20 w-full transition-all md:fixed bg-mulberry-300 dark:bg-mulberry-800 md:bg-transparent">
    <div class="mx-auto container">
      <div class="relative flex items-center justify-between h-16">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 text-kimberly-600 dark:text-kimberly-400 rounded-md hover:text-black dark:hover:text-kimberly-900 dark:text-kimberly-100 hover:bg-kimberly-300 dark:bg-kimberly-700 dark-hover:bg-kimberly-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded="false"
            @click="toggleMenuResponsive"
          >
            <svg
              class="block w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              :class="{ isopen: isMobileOpen }"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div
          class="flex items-center justify-center flex-1 sm:items-stretch sm:justify-start"
        >
          <div class="flex items-center flex-shrink-0">
            <nuxt-link to="/">
              <h1 class="text-xl font-bold text-kimberly-900 dark:text-kimberly-100">
                {{ config.title }}
              </h1>
            </nuxt-link>
          </div>
          <div class="hidden sm:block sm:ml-6">
            <div class="flex space-x-2">
              <nuxt-link
                v-for="(item, index) in menuItems.main"
                :key="index"
                :to="item.route || item.url"
                class="px-3 py-2 text-sm font-medium text-kimberly-900 dark:text-kimberly-100 rounded-md hover:bg-black transition-all hover:bg-opacity-20 hover:backdrop-blur-lg"
              >
                {{ item.name }}
              </nuxt-link>
            </div>
          </div>
        </div>
        <div v-click-outside="closeMenu" class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <div class="ml-3 relative">
            <div>
              <button
                id="user-menu-button"
                type="button"
                class="flex text-sm rounded-full transition-all items-center gap-2 text-kimberly-900 dark:text-kimberly-100"
                aria-expanded="false"
                aria-haspopup="true"
                @click="toggleMenu"
              >
                <span class="sr-only">Open user menu</span>
                <!-- <template v-if="$auth.loggedIn">
                  <img class="h-8 w-8 rounded-full" :src="`https://a.${config.baseUrl}/${$auth.user.id}`">
                  <h1 class="font-semibold">
                    Hi {{ $auth.user.name }}
                  </h1>
                </template>
                <template v-else>
                  <img class="h-8 w-8 rounded-full" :src="`https://a.${config.baseUrl}/0`">
                </template> -->
              </button>
            </div>

            <transition
              enter-active-class="transition-all duration-100 transform ease-out"
              enter-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100"
              leave-active-class="transition-all duration-100 transform ease-in"
              leave-class="opacity-100"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div
                v-show="isMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-[10rem] rounded-md shadow-lg py-1 bg-mulberry-300 dark:bg-mulberry-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <!-- <template v-if="!$auth.loggedIn">
                  <nuxt-link
                    v-for="(m, index) in menuItems.guest"
                    :key="index"
                    :to="m.url"
                    class="block px-4 py-2 text-sm text-kimberly-900 dark:text-kimberly-100 hover:border-l-2 transition-all font-semibold border-hsl-h2"
                    role="menuitem"
                    tabindex="-1"
                    @click.native="closeMenu"
                  >
                    {{ m.name }}
                  </nuxt-link>
                </template>
                <template v-else>
                  <nuxt-link
                    v-for="(m, index) in menuItems.user"
                    :key="index"
                    :to="m.url"
                    class="block px-4 py-2 text-sm text-kimberly-900 dark:text-kimberly-100 hover:border-l-2 transition-all font-semibold border-hsl-h2"
                    role="menuitem"
                    tabindex="-1"
                    @click.native="closeMenu"
                  >
                    {{ m.name }}
                  </nuxt-link>
                </template> -->
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div v-show="isMobileOpen" id="mobile-menu" class="sm:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <nuxt-link
            v-for="(item, index) in menuItems.main"
            :key="index"
            :to="item.route || item.url"
            class="block px-3 py-2 text-base font-medium text-kimberly-900 dark:text-kimberly-100 rounded-md"
            aria-current="page"
          >
            {{ item.name }}
          </nuxt-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAppConfig } from 'nuxt/app'
import vClickOutside from 'v-click-outside'
export default {
  name: 'NavbarDefault',
  directives: {
    clickOutside: vClickOutside.directive
  },
  setup () {
    const config = useAppConfig()
    return {
      config
    }
  },
  data () {
    return {
      isMenuOpen: false,
      isMobileOpen: false,
      menuItems: {
        main: [
          {
            name: 'Home',
            route: {
              name: 'index'
            }
          },
          {
            name: 'Leaderboard',
            route: {
              name: 'leaderboard'
            }
          },
          {
            name: 'playground',
            route: {
              name: 'components'
            }
          },
          {
            name: 'test user page',
            route: {
              name: 'user-handle',
              params: {
                handle: 1
              }
            }
          }
        ],
        user: [
          { name: 'Profile', url: '/dashboard' },
          { name: 'Settings', url: '/dashboard' },
          { name: 'Sign out', url: '/auth/logout' }
        ],
        guest: [
          { name: 'Sign in', url: '/auth/login' },
          { name: 'Sign up', url: '/auth/register' }
        ]
      }
    }
  },
  methods: {
    closeMenu () {
      this.isMenuOpen = false
    },
    toggleMenu () {
      this.isMenuOpen = !this.isMenuOpen
    },
    toggleMenuResponsive () {
      this.isMobileOpen = !this.isMobileOpen
    }
  }
}
</script>

<style>
.isopen path {
  transition: 0.2s;
  d: path("M6 18L18 6M6 6l12 12");
}
</style>
