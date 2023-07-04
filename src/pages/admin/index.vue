<script setup lang="ts">

</script>

<template>
  <div class="join">
    <t-nuxt-link-button
      :to="{
        name: 'article-edit',
      }"
      class="join-item"
    >
      Edit Articles (outside from admin)
    </t-nuxt-link-button>
    <t-nuxt-link-button
      :to="{
        name: 'admin-logs',
      }"
      class="join-item"
    >
      Logs
    </t-nuxt-link-button>
  </div>
</template>

<style scoped>

</style>
