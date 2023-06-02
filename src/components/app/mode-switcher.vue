<script setup lang="ts">
import type { LeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'

interface modelValue {
  mode?: Mode
  ruleset?: Ruleset
  rankingSystem?: LeaderboardRankingSystem
}
const props = defineProps<{
  showSort?: boolean
  modelValue?: modelValue
}>()

const emit = defineEmits<{
  (event: 'input', res: modelValue): void
  (event: 'update:modelValue', res: modelValue): void
}>()
const config = useAppConfig()
const { hasLeaderboardRankingSystem, hasRuleset } = useAdapterConfig()

const [switcher, setSwitcher] = useLeaderboardSwitcher(
  toRaw(props.modelValue) || {}
)
function emitData() {
  emit('input', toRaw(switcher))
  emit('update:modelValue', toRaw(switcher))
}
watch(switcher, () => emitData())
</script>

<template>
  <div class="mt-4 grid sm:mt-0 md:gap-1">
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, mode) in config.mode"
        :key="mode"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none': switcher.mode === mode,
          '!opacity-10 pointer-events-none':
            switcher.ruleset && !hasRuleset(mode, switcher.ruleset),
        }"
        @click="setSwitcher({ mode })"
      >
        <img
          :src="`/icons/mode/${m.icon}.svg`"
          class="color-theme-light-invert"
        >
      </a>
    </div>
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, ruleset) in config.ruleset"
        :key="ruleset"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none': switcher.ruleset === ruleset,
          '!opacity-20 pointer-events-none':
            switcher.mode && !hasRuleset(switcher.mode, ruleset),
        }"
        @click="setSwitcher({ ruleset })"
      >
        {{ m.name }}
      </a>
    </div>
    <div
      v-if="props.showSort"
      class="flex justify-center gap-3 md:gap-3 lg:gap-3"
    >
      <template
        v-for="(s, rankingSystem) in config.leaderboardRankingSystem"
        :key="rankingSystem"
      >
        <a
          v-if="
            hasRuleset(switcher.mode, switcher.ruleset)
              && hasLeaderboardRankingSystem(
                switcher.mode,
                switcher.ruleset,
                rankingSystem,
              )
          "
          class="text-sm h-mode"
          :class="{
            '!opacity-80 pointer-events-none':
              switcher.rankingSystem === rankingSystem,
          }"
          @click="setSwitcher({ rankingSystem })"
        >
          {{ s.name }}
        </a>
      </template>
    </div>
  </div>
</template>

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
  filter: invert(100%);
  @apply dark:[filter:invert(0)];
}
</style>
