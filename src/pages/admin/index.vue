<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="join">
    <t-nuxt-link-locale-button
      :to="{
        name: 'article-edit',
      }"
      class="join-item"
    >
      {{ t('titles.articles') }}
    </t-nuxt-link-locale-button>
    <t-nuxt-link-locale-button
      :to="{
        name: 'admin-logs',
      }"
      class="join-item"
    >
      {{ t('titles.logs') }}
    </t-nuxt-link-locale-button>
  </div>
</template>

<style scoped>

</style>
