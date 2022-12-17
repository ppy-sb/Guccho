<!-- monkey patch for fa-icon rendering nothing on server thus breaking hydration (due to not adding icons in advance I guess?) -->
<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
</script>

<template>
  <client-only>
    <FontAwesomeIcon v-bind="$attrs" />
  </client-only>
</template>
