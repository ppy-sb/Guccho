<template>
  <app-layout :has-bg="true">
    <slot />
    <template #footer>
      <footer class="py-4 text-center bottom-1">
        <h3 v-if="safari">
          dev note: some visual effects are disabled for safari to improve performance.
        </h3>
        <h1 class="text-sm font-semibold text-kimberly-900 dark:text-kimberly-100">
          © {{ new Date().getFullYear() }} ppy.sb | Varkaria
        </h1>
        <h2 class="text-sm font-semibold font-bold text-kimberly-900 dark:text-kimberly-100">
          <span class="text-green-700 dark:text-green-400">API</span> {{ config.version.api }}
          <span class="text-yellow-600 dark:text-yellow-400">FRONT</span> {{ config.version.front }}
        </h2>
      </footer>
    </template>
  </app-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppConfig } from '#app'
import { useSafariDetector } from '#imports'
const safari = ref(true)

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
})
</script>
