<script setup lang="ts">
const props = defineProps<{
  error: Error
}>()
const { t } = useI18n()

async function handleError() {
  return await clearError({ redirect: '/' })
}
</script>

<i18n lang='yaml'>
en-GB:
  clear: Clear errors and try again
</i18n>

<template>
  <div class="card">
    <div class="card-body">
      {{ props.error }}
      <button @click="handleError">
        {{ t('clear') }}
      </button>
    </div>
  </div>
</template>
