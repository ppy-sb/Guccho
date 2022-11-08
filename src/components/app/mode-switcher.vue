<template>
  <div class="mt-4 grid sm:mt-0 md:gap-1">
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, index) in leaderboard.mode.list"
        :key="index"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none':leaderboard.mode.selected?.name === m.name,
          '!opacity-10 pointer-events-none':leaderboard.ruleset.selected && forbiddenMode(leaderboard.ruleset.selected.ruleset, m.mode)
        }"
        @click="changeValue('mode', index)"
      >
        <img :src="`/icons/mode/${m.icon}.svg`" class="color-theme-light-invert">
      </a>
    </div>
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, index) in leaderboard.ruleset.list"
        :key="index"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none':leaderboard.ruleset.selected?.name === m.name,
          '!opacity-20 pointer-events-none':leaderboard.mode.selected && forbiddenMods(leaderboard.mode.selected.mode, m.ruleset)
        }"
        @click="changeValue('ruleset', index)"
      >
        {{ m.name }}
      </a>
    </div>
    <div v-if="props.showSort" class="flex justify-center gap-3 md:gap-3 lg:gap-3">
      <a
        v-for="(s, index) in leaderboard.rankingSystem.list"
        :key="index"
        class="text-sm h-mode"
        :class="{ '!opacity-80 pointer-events-none':leaderboard.rankingSystem.selected?.name === s.name }"
        @click="changeValue('rankingSystem', index)"
      >
        {{ s.name }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppConfig } from '#app'
import { ref, onMounted } from 'vue'
import { forbiddenMode, forbiddenMods } from '~/common/varkaUtils'
import type { AppConfig } from '~/app.config'
import { RankingSystem, Mode, Ruleset } from '~/types/common'
const config = useAppConfig() as AppConfig
// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (event:'input', res:{
    mode?:{value: Mode, name: string},
    ruleset?:{value: Ruleset, name: string},
    rankingSystem?:{value: RankingSystem, name: string}
  }):void
}>()
const props = defineProps({
  showSort: {
    type: Boolean,
    default: false
  }
})

type RankingSystemItem = {
  name:string,
  icon:string,
  rank:RankingSystem
}
const leaderboard = ref({
  mode: {
    selected: undefined as AppConfig['mode'][0] | undefined,
    list: [] as AppConfig['mode']
  },
  ruleset: {
    selected: undefined as AppConfig['rulesets'][0] | undefined,
    list: [] as AppConfig['rulesets']
  },
  rankingSystem: {
    selected: undefined as RankingSystemItem | undefined,
    list: [
      {
        name: 'Performance',
        icon: 'pp',
        rank: 'ppv2'
      },
      // {
      //   name:'Accuracy',
      //   icon:'acc'
      // },
      {
        name: 'Total Score',
        icon: 'tscore',
        rank: 'totalScore'
      },
      {
        name: 'Ranked score',
        icon: 'rscore',
        rank: 'rankedScore'
      }
    ] as RankingSystemItem[]
  }
})
const emitData = () => emit('input', {
  mode: leaderboard.value.mode.selected && {
    value: leaderboard.value.mode.selected.mode,
    name: leaderboard.value.mode.selected.name
  },
  ruleset: leaderboard.value.ruleset.selected && {
    value: leaderboard.value.ruleset.selected?.ruleset,
    name: leaderboard.value.ruleset.selected?.name
  },
  rankingSystem: leaderboard.value.rankingSystem.selected && {
    value: leaderboard.value.rankingSystem.selected?.rank,
    name: leaderboard.value.rankingSystem.selected?.name
  }
})

const changeValue = (type:'mode' | 'ruleset' | 'rankingSystem', index:number) => {
  leaderboard.value[type].selected = leaderboard.value[type].list[index]
  emitData()
}

const initLeaderboard = () => {
  leaderboard.value.mode.list = config.mode
  leaderboard.value.ruleset.list = config.rulesets
  leaderboard.value.mode.selected = leaderboard.value.mode.list[0]
  leaderboard.value.ruleset.selected = leaderboard.value.ruleset.list[0]
  leaderboard.value.rankingSystem.selected = leaderboard.value.rankingSystem.list[0]
  emitData()
}

onMounted(() => {
  initLeaderboard()
})
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
