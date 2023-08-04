<script setup lang="ts">
import type { LocaleObject } from 'vue-i18n-routing'
import { useSession } from '~/store/session'
import { UserPrivilege } from '~/def/user'

const session = useSession()
const { t, locale, locales, setLocale } = useI18n()

const _locale = computed({
  get: () => locale.value,
  set(locale) {
    setLocale(locale)
  },
})

function clearFocus() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
</script>

<template>
  <li>
    <nuxt-link-locale :to="{ name: 'leaderboard-mode' }" @click="clearFocus">
      <icon name="material-symbols:leaderboard-rounded" class="w-5 h-5" size="100%" />
      {{ t('titles.leaderboard') }}
    </nuxt-link-locale>
  </li>
  <li v-if="session.user?.roles.includes(UserPrivilege.Staff)">
    <nuxt-link-locale :to="{ name: 'status' }" @click="clearFocus">
      <icon name="material-symbols:signal-cellular-alt-rounded" class="w-5 h-5" size="100%" />
      {{ t('titles.status') }}
    </nuxt-link-locale>
  </li>
  <select v-model="_locale" class="select select-ghost w-min-content select-sm">
    <option value="" disabled>
      select
    </option>
    <option
      v-for="l in (locales as LocaleObject[])"
      :key="l.code"
      :value="l.code"
      :disabled="l.code === _locale"
    >
      {{ l.name }}
    </option>
  </select>
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
