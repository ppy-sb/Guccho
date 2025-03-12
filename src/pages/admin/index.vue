<script lang="ts" setup>
import { useSession } from '~/store/session'

const app = useNuxtApp()

useHead({
  title: () => app.$i18n.t(localeKey.title['admin-panel'].__path__),
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
})
</script>

<template>
  <div class="container mx-auto custom-container">
    Index
  </div>
</template>
