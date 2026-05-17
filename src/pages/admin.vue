<script setup lang="ts">
import { UserRole } from '../def/user'
import { useSession } from '../store/session'
import { showAdminPanel } from '~/common/utils/admin'

definePageMeta({
  middleware: ['auth'],
})

const user = useSession()

if (!showAdminPanel(user.user!.roles)) {
  await navigateTo({
    name: 'article-id',
    params: {
      id: ['403'],
    },
  })
}
const session = useSession()
</script>

<template>
  <div class="relative flex flex-col items-start gap-2 ps-2 lg:ps-0 pe-2 lg:flex-row ">
    <ul class="sticky lg:top-[4em] overflow-x-auto lg:overflow-visible menu lg:ps-0 menu-horizontal lg:menu-vertical bg-base-100 lg:rounded-r-xl">
      <li>
        <nuxt-link-locale
          class="whitespace-nowrap"
          :to="{
            name: 'admin',
          }"
        >
          {{ $t(localeKey.title['admin-panel'].__path__) }}
        </nuxt-link-locale>
      </li>
      <li v-if="session.role.admin || session.role.owner || session.role.staff">
        <nuxt-link-locale
          class="whitespace-nowrap"
          :to="{
            name: 'article-edit',
          }"
        >
          {{ $t(localeKey.title.articles.__path__) }}
        </nuxt-link-locale>
      </li>
      <li v-if="session.role.admin">
        <nuxt-link-locale
          class="whitespace-nowrap"
          :to="{
            name: 'admin-logs',
          }"
        >
          {{ $t(localeKey.title.logs.__path__) }}
        </nuxt-link-locale>
      </li>
      <li v-if="session.role.admin || session.role.owner || session.user?.roles.includes(UserRole.Moderator)">
        <nuxt-link-locale
          class="whitespace-nowrap"
          :to="{
            name: 'admin-users',
          }"
        >
          {{ $t(localeKey.title['user-management'].__path__) }}
        </nuxt-link-locale>
      </li>
      <li v-if="session.user?.roles.includes(UserRole.BeatmapNominator)">
        <nuxt-link-locale
          class="whitespace-nowrap"
          :to="{
            name: 'admin-beatmaps',
          }"
        >
          BN
        </nuxt-link-locale>
      </li>
    </ul>
    <div class="w-full">
      <nuxt-page />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.router-link-exact-active {
  @apply active
}
.menu > li > a {
  @apply lg:rounded-l-none
}
</style>
