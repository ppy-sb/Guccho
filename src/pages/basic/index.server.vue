<script setup lang="ts">
import { useSession } from '~/store/session'

const session = useSession()
</script>

<template>
  <div>
    <h1>welcome to {}</h1>
    <a v-if="session.loggedIn" :to="{ name: 'settings' }">
      settings
    </a>
  </div>
</template>

<style scoped>

</style>
