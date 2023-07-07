<script setup lang="ts">
import userpageStore from '~/store/userpage'

const page = userpageStore()
</script>

<template>
  <div class="container mx-auto mt-4 custom-container">
    <content-render v-if="page.user?.profile" :json="page.user.profile.raw" :html="page.user.profile.html" />
  </div>
</template>
