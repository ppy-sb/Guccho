<script setup lang="ts">
import {
  faRankingStar, faSignal,
} from '@fortawesome/free-solid-svg-icons'
import { useSession } from '~/store/session'
import { UserPrivilege } from '~/types/user'

const { addToLibrary } = useFAIcon()
addToLibrary(
  faRankingStar,
  faSignal
)
function clearFocus() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
const session = useSession()
</script>

<template>
  <li>
    <nuxt-link :to="{ name: 'leaderboard-mode' }" @click="clearFocus">
      <icon name="material-symbols:leaderboard-rounded" class="w-5 h-5" size="100%" />
      Leaderboard
    </nuxt-link>
  </li>
  <li v-if="session.user?.roles.includes(UserPrivilege.Staff)">
    <nuxt-link :to="{ name: 'status' }" @click="clearFocus">
      <icon name="material-symbols:signal-cellular-alt-rounded" class="w-5 h-5" size="100%" />
      Status
    </nuxt-link>
  </li>
  <!-- <li tabindex="0">
    <a class="justify-between lg:justify-start">
      Parent
      <svg class="fill-current hidden lg:block" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>
      <svg class="fill-current lg:hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>
    </a>
    <ul class="p-2 menu m-4 bg-base-100">
      <li><a>Submenu 1</a></li>
      <li><a>Submenu 2</a></li>
    </ul>
  </li>
  <li><a>Item 3</a></li> -->
</template>
