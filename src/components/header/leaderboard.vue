<template>
  <header-simple-title-with-sub
    class="container mx-auto custom-container lg:px-4"
    title="Leaderboard"
    :subtitle="`${copy.mode?.name} - ${copy.ruleset?.name} | ${copy.rankingSystem?.name}`"
  >
    <app-mode-switcher :show-sort="true" @input="updateTitle" />
  </header-simple-title-with-sub>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Mode, RankingSystem, Ruleset } from '~~/src/types/common'

type EmitType = {
    mode?:{value: Mode, name: string},
    ruleset?:{value: Ruleset, name: string},
    rankingSystem?:{value: RankingSystem, name: string}
}

const props = defineProps<{
  modelValue?: EmitType
}>()

const copy = ref<EmitType>({
  ...props.modelValue
})

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (event:'input', res:{
    mode?:{value: Mode, name: string},
    ruleset?:{value: Ruleset, name: string},
    rankingSystem?:{value: RankingSystem, name: string}
  }):void,
  (event:'update:modelValue', res:{
    mode?:{value: Mode, name: string},
    ruleset?:{value: Ruleset, name: string},
    rankingSystem?:{value: RankingSystem, name: string}
  }):void
}>()
const updateTitle = (input: EmitType) => {
  copy.value = input
  emit('input', input)
  emit('update:modelValue', input)
}
</script>
