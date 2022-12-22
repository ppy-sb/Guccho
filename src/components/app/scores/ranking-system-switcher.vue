<script setup lang="ts">
import type { RankingSystem } from '~/types/common'
import { rankingSystem } from '~/types/common'
const props = defineProps<{
  modelValue: RankingSystem
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: RankingSystem): void
}>()
const app = useAppConfig()
const { supportedRankingSystems } = useAdapterConfig()
</script>

<template>
  <t-tabs :model-value="props.modelValue" variant="lifted" @update:model-value="v => emit('update:modelValue', v)">
    <template v-for="rs in rankingSystem">
      <t-tab v-if="supportedRankingSystems.includes(rs)" :key="`rs-${rs}`" :value="rs" class="[--tab-border-color:transparent]">
        {{ app.rankingSystem[rs].name }}
      </t-tab>
    </template>
  </t-tabs>
</template>

