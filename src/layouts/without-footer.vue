<script setup lang="ts">
import { onMounted, ref } from 'vue'
const safari = ref(true)
onMounted(() => {
  safari.value = useSafariDetector()
})
</script>

<template>
  <app-layout :has-bg="true">
    <slot />
  </app-layout>
</template>
