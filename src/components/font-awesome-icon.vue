<!-- monkey patch for fa-icon rendering nothing on server thus breaking hydration (due to not adding icons in advance I guess?) -->
<template>
  <client-only>
    <font-awesome-icon v-bind="$attrs" />
  </client-only>
</template>

<script setup>
// (for sure you can import this!)
// eslint-disable-next-line import/named
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<style scoped>

</style>
