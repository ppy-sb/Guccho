<script setup lang="ts" async>
const app = useNuxtApp()
const serverLogs = await app.$client.admin.log.last.query(50)
const { t, locale } = useI18n()
const logs = ref(serverLogs.reverse())
</script>

<template>
  <div>
    <h1 class="mb-10 italic font-bold">
      {{ t('titles.logs') }}
    </h1>
    <div v-for="log in logs" :key="`log-${log.timestamp}`" class="relative mt-5 text-left">
      <div class="relative flex items-center">
        <div class="hidden w-20 md:block">
          <div
            class="italic font-bold capitalize" :class="{
              'text-sky-600 dark:text-sky-300': log.level === 'info',
            }"
          >
            {{ log.level }}
          </div>
          <div class="space-x-1 font-mono text-xs md:flex">
            {{ log.timestamp.toLocaleString(locale) }}
          </div>
        </div>
        <div class="absolute z-10 h-full border-r-2 border-black dark:border-white left-1 md:left-20 top-2">
          <i class="absolute -ml-2 fas fa-circle -top-1" />
        </div>
        <div class="ml-10">
          <div class="font-bold capitalize">
            {{ log.label }}
          </div>
          <div class="text-sm italic capitalize md:mb-4">
            <template v-if="log.backend">
              {{ log.backend }}
            </template>
          </div>
          <div class="mt-2 mb-4 md:hidden">
            <div class="font-bold">
              {{ log.timestamp.toLocaleDateString(locale) }}
            </div>
            <div class="text-xs">
              {{ log.timestamp.toLocaleTimeString(locale) }}
            </div>
          </div>
          <div v-if="log.message" class="mb-2 font-mono text-sm`">
            {{ log.message }}
          </div>
          <div v-if="log.fix" class="mb-4 font-mono text-xs text-gbase-700 dark:text-gbase-300">
            {{ log.fix }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
