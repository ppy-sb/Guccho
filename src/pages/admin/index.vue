<script setup lang="ts">
const { t } = useI18n()
</script>

<i18n lang="yaml">
en-GB:
  user-management: User Management
</i18n>

<template>
  <div class="join">
    <t-nuxt-link-button
      :to="{
        name: 'article-edit',
      }"
      class="btn-shadow join-item"
    >
      {{ t('titles.articles') }}
    </t-nuxt-link-button>
    <t-nuxt-link-button
      :to="{
        name: 'admin-logs',
      }"
      class="btn-shadow join-item"
    >
      {{ t('titles.logs') }}
    </t-nuxt-link-button>
    <t-nuxt-link-button
      :to="{
        name: 'admin-users',
      }"
      class="btn-shadow join-item"
    >
      {{ t('user-management') }}
    </t-nuxt-link-button>
  </div>
</template>

<style scoped>

</style>
