<template>
  <div class="mt-4 grid sm:mt-0 md:gap-1">
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, index) in leaderboard.mode.list"
        :key="index"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none': leaderboard.mode.selected?.name === m.name,
          '!opacity-10 pointer-events-none': $forbiddenMode(leaderboard.mod.selected.icon, m.icon)
        }"
        @click="changeValue('mode', index)"
      >
        <img :src="`/icons/mode/${m.icon}.svg`" class="color-theme-light-invert">
      </a>
    </div>
    <div class="flex justify-around gap-4 md:gap-2 lg:gap-4">
      <a
        v-for="(m, index) in leaderboard.mod.list"
        :key="index"
        class="h-mode"
        :class="{
          '!opacity-80 pointer-events-none': leaderboard.mod.selected?.name === m.name,
          '!opacity-20 pointer-events-none': $forbiddenMods(leaderboard.mode.selected.icon, m.icon)
        }"
        @click="changeValue('mod', index)"
      >
        {{ m.name }}
      </a>
    </div>
    <div v-if="props.showSort" class="flex justify-center gap-3 md:gap-3 lg:gap-3">
      <a
        v-for="(s, index) in leaderboard.sort.list"
        :key="index"
        class="text-sm h-mode"
        :class="{ '!opacity-80 pointer-events-none': leaderboard.sort.selected?.name === s.name }"
        @click="changeValue('sort', index)"
      >
        {{ s.name }}
      </a>
    </div>
  </div>
</template>

<script setup>
const config = useAppConfig()
const emit = defineEmits(['input'])
const props = defineProps({
  showSort: {
    type: Boolean,
    default: false
  }
})
const leaderboard = ref({
  mode: {
    selected: undefined,
    list: []
  },
  mod: {
    selected: undefined,
    list: []
  },
  sort: {
    selected: undefined,
    list: [
      {
        name: 'Performance',
        icon: 'pp'
      },
      {
        name: 'Accuracy',
        icon: 'acc'
      },
      {
        name: 'Total Score',
        icon: 'tscore'
      },
      {
        name: 'Ranked score',
        icon: 'rscore'
      }
    ]
  }
})

const changeValue = (type, index) => {
  leaderboard.value[`${type}`].selected = leaderboard.value[`${type}`].list[`${index}`]
  emit('input', leaderboard.value)
}

const initLeaderboard = () => {
  leaderboard.value.mode.list = config.mode
  leaderboard.value.mod.list = config.mods
  leaderboard.value.mode.selected = leaderboard.value.mode.list[0]
  leaderboard.value.mod.selected = leaderboard.value.mod.list[0]
  leaderboard.value.sort.selected = leaderboard.value.sort.list[0]
  emit('input', leaderboard.value)
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

.light .color-theme-light-invert {
  filter: invert(100%)
}
</style>
