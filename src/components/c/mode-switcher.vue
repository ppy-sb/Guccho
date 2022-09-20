<template>
  <div class="grid mt-4 sm:mt-0 md:gap-1">
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
        <img :src="`/assets/icons/mode/${m.icon}.svg`">
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
    <div v-if="showSort" class="flex justify-center gap-3 md:gap-3 lg:gap-3">
      <a
        v-for="(s, index) in leaderboard.sort.list"
        :key="index"
        class="h-mode text-sm"
        :class="{ '!opacity-80 pointer-events-none': leaderboard.sort.selected?.name === s.name }"
        @click="changeValue('sort', index)"
      >
        {{ s.name }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaderboardHeader',
  props: {
    showSort: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      leaderboard: {
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
      }
    }
  },
  mounted () {
    this.initLeaderboard()
    this.$emit('input', this.leaderboard)
  },
  methods: {
    changeValue (type, index) {
      this.leaderboard[`${type}`].selected = this.leaderboard[`${type}`].list[`${index}`]
      this.$emit('input', this.leaderboard)
    },
    initLeaderboard () {
      this.leaderboard.mode.list = this.$config.public.mode
      this.leaderboard.mod.list = this.$config.public.mods
      this.leaderboard.mode.selected = this.leaderboard.mode.list[0]
      this.leaderboard.mod.selected = this.leaderboard.mod.list[0]
      this.leaderboard.sort.selected = this.leaderboard.sort.list[0]
    }
  }
}
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
</style>
