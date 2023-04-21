<script setup lang="ts">
import userpageStore from '~/store/userpage'

const page = userpageStore()
</script>

<template>
  <article-render v-if="page.user?.profile" :json="page.user.profile.raw" :html="page.user.profile.html" />
</template>
