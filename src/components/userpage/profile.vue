<script setup lang="ts">
import userpageStore from '~/store/userpage'

const page = await userpageStore()
</script>

<template>
  <article-render v-if="page.user?.profile?.html" :json="page.user.profile.raw" :html="page.user.profile.html" />
</template>
