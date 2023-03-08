<script setup lang="ts">
import type { Mode, RankingSystem, Ruleset } from '~/types/common'
import { rankingSystems } from '~/types/defs'
const props = defineProps<{
  modelValue: RankingSystem
  mode: Mode
  ruleset: Ruleset
  rankingSystemList?: RankingSystem[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: RankingSystem): void
  (e: 'update:rankingSystemList', v: RankingSystem[]): void
}>()
const app = useAppConfig()
const { hasRankingSystem, hasRuleset } = useAdapterConfig()

const show = computed(() => {
  return rankingSystems.filter(
    rs =>
      hasRuleset(props.mode, props.ruleset)
      && hasRankingSystem(props.mode, props.ruleset, rs),
  )
})
watch([() => props.mode, () => props.ruleset], () => {
  emit('update:rankingSystemList', show.value)
})
</script>

<template>
  <t-tabs
    :model-value="props.modelValue"
    variant="lifted"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <t-tab
      v-for="rs in show"
      :key="`rs-${rs}`"
      :value="rs"
      class="[--tab-border-color:transparent]"
    >
      {{ app.rankingSystem[rs].name }}
    </t-tab>
  </t-tabs>
</template>
