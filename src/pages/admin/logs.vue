<script setup lang="ts" async>
import 'vue3-json-viewer/dist/index.css'

const app = useNuxtApp()
const serverLogs = await app.$client.admin.log.last.query(50)

const logs = ref(serverLogs.reverse())
</script>

<template>
  <div>
    <h1 class="font-bold italic mb-10">
      Logs
    </h1>
    <!-- <JsonViewer v-for="(log, index) in logs" :key="`log-${index}`" :value="log" /> -->
    <div v-for="log in logs" :key="`log-${log.timestamp}`" class="relative mt-5 text-left">
      <div class="flex items-center relative">
        <div class="hidden md:block w-20">
          <div
            class="font-bold italic capitalize" :class="{
              'text-sky-600 dark:text-sky-300': log.level === 'info',
            }"
          >
            {{ log.level }}
          </div>
          <div class="md:flex space-x-1 text-xs font-mono">
            {{ log.timestamp.toLocaleString() }}
          </div>
        </div>
        <div class="border-r-2 border-black dark:border-white absolute h-full left-1 md:left-20 top-2 z-10">
          <i class="fas fa-circle -top-1 -ml-2 absolute" />
        </div>
        <div class="ml-10">
          <div class="font-bold capitalize">
            {{ log.label }}
          </div>
          <div class="italic md:mb-4 capitalize text-sm">
            <template v-if="log.backend">
              {{ log.backend }} Backend
            </template>
          </div>
          <div class="mb-4 mt-2 md:hidden">
            <div class="font-bold">
              {{ log.timestamp.toLocaleDateString() }}
            </div>
            <div class="text-xs">
              {{ log.timestamp.toLocaleTimeString() }}
            </div>
          </div>
          <div v-if="log.message" class="mb-2 font-mono text-sm`">
            {{ log.message }}
          </div>
          <div v-if="log.fix" class="mb-4 font-mono text-gbase-700 dark:text-gbase-300 text-xs">
            {{ log.fix }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
