<script setup lang="ts">

</script>

<template>
  <div>
    <t-nuxt-link-button
      :to="{
        name: 'article-edit',
      }"
    >
      Edit Articles (outside from admin)
    </t-nuxt-link-button>
    <t-nuxt-link-button
      :to="{
        name: 'admin-logs',
      }"
    >
      Logs
    </t-nuxt-link-button>
  </div>
</template>

<style scoped>

</style>
