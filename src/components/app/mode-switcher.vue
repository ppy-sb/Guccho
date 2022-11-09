<!-- eslint-disable vue/no-v-for-template-key -->
<template>
  <div class="mt-4 grid sm:mt-0 md:gap-1">
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, mode) in config.mode"
        :key="mode"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none':selected.mode === mode,
          '!opacity-10 pointer-events-none':selected.ruleset && forbiddenMode(selected.ruleset, mode)
        }"
        @click="selected.mode = mode"
      >
        <img :src="`/icons/mode/${m.icon}.svg`" class="color-theme-light-invert">
      </a>
    </div>
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, ruleset) in config.ruleset"
        :key="ruleset"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none':selected.ruleset === ruleset,
          '!opacity-20 pointer-events-none':selected.mode && forbiddenMods(selected.mode, ruleset)
        }"
        @click="selected.ruleset = ruleset"
      >
        {{ m.name }}
      </a>
    </div>
    <div v-if="props.showSort" class="flex justify-center gap-3 md:gap-3 lg:gap-3">
      <template
        v-for="(s, rankingSystem) in config.rankingSystem"
        :key="rankingSystem"
      >
        <a
          v-if="rankingSystem in serverRankingSystemConfig"
          class="text-sm h-mode"
          :class="{ '!opacity-80 pointer-events-none': selected.rankingSystem === rankingSystem }"
          @click="selected.rankingSystem = rankingSystem"
        >
          {{ s.name }}
        </a>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppConfig } from '#app'
import { reactive, watch, toRaw } from 'vue'
import { forbiddenMode, forbiddenMods } from '~/common/varkaUtils'
import type { AppConfig } from '~/app.config'
import { RankingSystem, Mode, Ruleset } from '~/types/common'
import { serverRankingSystemConfig } from '~/server/trpc/config'
export interface EmitType {
  input: {
    mode?:Mode,
    ruleset?:Ruleset,
    rankingSystem?:RankingSystem
  }
}
const config = useAppConfig() as AppConfig

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (event:'input', res:EmitType['input']):void,
  (event:'update:modelValue', res:EmitType['input']):void
}>()
const props = defineProps<{
  showSort?: boolean,
  modelValue?: EmitType['input']
}>()

const selected = reactive<EmitType['input']>(toRaw(props.modelValue) || {})
const emitData = () => {
  emit('input', toRaw(selected))
  emit('update:modelValue', toRaw(selected))
}
watch(selected, () => emitData())
</script>

<style lang="postcss" scoped>
.h-mode {
  @apply py-0 my-4 transition duration-200 ease-in-out font-semibold opacity-50 cursor-pointer;
  @apply sm:py-1 sm:my-0;
  @apply hover:opacity-100;

  & img {
    @apply w-7 h-7;
  }
}

.color-theme-light-invert {
  filter:invert(100%);
  @apply dark:[filter:invert(0)]
}
</style>
