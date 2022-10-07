<script setup lang="ts">
import { onBeforeMount } from 'vue'

const menu = [
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
    name: '[dev] playground',
    route: {
      name: 'playground'
    }
  },
  // {
  //   name: 'playground',
  //   route: {
  //     name: 'components'
  //   }
  // },
  {
    name: 'user page',
    route: {
      name: 'user-handle',
      params: {
        handle: 1
      }
    }
  },
  {
    name: 'user preferences',
    route: {
      name: 'me-preferences'
    }
  }
]
const config = useAppConfig()
const scrolledDown = ref(false)
const root = ref<HTMLElement>()
const handleScroll = () => {
  if (!root.value) { return }

  scrolledDown.value = window.pageYOffset > 0
}
onBeforeMount(() => {
  document.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll)
})
</script>
<template>
  <div ref="root" class="w-full z-50 transition-all absolute" :class="[scrolledDown && 'p-2 !fixed']">
    <div class="navbar navbar-tint transition-all" :class="[scrolledDown && 'rounded-xl']">
      <div class="navbar-start">
        <div class="dropdown">
          <label tabindex="0" class="btn btn-ghost btn-circle !shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
          </label>
          <ul tabindex="0" class="menu menu-compact dropdown-content bg-kimberly-100 dark:bg-kimberly-600 mt-3 p-2 shadow-xl rounded-box w-52">
            <li v-for="menuItem in menu" :key="`menu-${menuItem.name}`">
              <nuxt-link :to="menuItem.route">
                {{ menuItem.name }}
              </nuxt-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="navbar-center lg:hidden">
        <!-- <a class="btn btn-ghost !shadow-none normal-case text-xl">guweb@next</a> -->
        <nuxt-link :to="{name: 'index'}" class="btn btn-ghost !shadow-none normal-case text-xl">
          guweb@next
        </nuxt-link>
      </div>
      <div class="navbar-center hidden lg:flex gap-2">
        <!-- <a class="btn btn-ghost !shadow-none normal-case text-xl">guweb@next</a> -->
        <!-- <nuxt-link :to="{name: 'index'}" class="btn btn-ghost !shadow-none normal-case text-xl">
          guweb@next
        </nuxt-link> -->
        <nuxt-link v-for="menuItem in menu" :key="`menu-${menuItem.name}`" :to="menuItem.route" class="btn btn-ghost !shadow-none normal-case text-lg">
          {{ menuItem.name }}
        </nuxt-link>
      </div>
      <div class="navbar-end">
        <button class="btn btn-ghost !shadow-none btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </button>
        <button class="btn btn-ghost !shadow-none btn-circle">
          <div class="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span class="badge badge-xs badge-primary indicator-item" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .navbar-tint {
    @apply bg-kimberly-100/80 dark:bg-kimberly-600/70;
    @apply backdrop-blur-md shadow-xl
}
</style>
