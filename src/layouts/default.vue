<script setup lang="ts">
import { useSafariDetector } from '#imports'
const safari = ref(true)

onBeforeMount(() => {
  safari.value = useSafariDetector()
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex flex-col flex-grow">
      <slot />
    </div>
    <slot name="footer">
      <footer class="py-4 text-center bottom-1">
        <h3 v-if="safari">
          dev note: some visual effects are disabled for safari to improve
          performance.
        </h3>
        <h1
          class="text-sm font-semibold text-kimberly-900 dark:text-kimberly-100"
        >
          © {{ new Date().getFullYear() }} ppy.sb | Varkaria
        </h1>
        <!-- <h2 class="text-sm font-semibold font-bold text-kimberly-900 dark:text-kimberly-100">
            <span class="text-green-700 dark:text-green-400">API</span> {{ config.version.api }}
            <span class="text-yellow-600 dark:text-yellow-400">FRONT</span> {{ config.version.front }}
          </h2> -->
      </footer>
    </slot>
  </div>
</template>
