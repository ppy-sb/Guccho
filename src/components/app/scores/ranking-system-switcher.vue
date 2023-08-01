<script setup lang="ts">
import type { ActiveMode, ActiveRuleset, RankingSystem } from '~/def/common'

const props = defineProps<{
  modelValue: RankingSystem
  mode: ActiveMode
  ruleset: ActiveRuleset
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: RankingSystem): void
  (e: 'update:rankingSystemList', v: RankingSystem[]): void
}>()

const { hasRankingSystem, hasRuleset, supportedRankingSystems: rankingSystems } = useAdapterConfig()
const { t } = useI18n()

const show = computed(() =>
  rankingSystems.filter(
    rs =>
      hasRuleset(props.mode, props.ruleset)
      && hasRankingSystem(props.mode, props.ruleset, rs)
  )
)
defineExpose({
  rankingSystems: show,
})
watch([() => props.mode, () => props.ruleset], () => {
  emit('update:rankingSystemList', show.value)
})
</script>

<template>
  <t-tabs
    :model-value="props.modelValue"
    variant="lifted"
    @update:model-value="(v: typeof props['modelValue']) => emit('update:modelValue', v)"
  >
    <t-tab
      v-for="rs in show"
      :key="`rs-${rs}`"
      :value="rs"
      class="[--tab-border-color:transparent]"
    >
      {{ t(localeKey.rankingSystem(rs)) }}
    </t-tab>
  </t-tabs>
</template>
