<template>
  <div class="h-header bg-hsl-h2">
    <div class="container sm:flex sm:w-full mt-2 items-center justify-between text-center text-white">
      <header-simple-title-with-sub
        title="Leaderboard"
        :subtitle="`${leaderboard.mode.selected.name} - ${leaderboard.mods.selected.name}`"
        class="text-left"
      />

      <div class="grid mt-4 sm:mt-0 gap-1 sm:gap-1">
        <div class="flex justify-center">
          <a
            v-for="(m, index) in leaderboard.mods.list"
            :key="index"
            class="h-mode !px-4"
            :class="{ '!opacity-80 pointer-events-none': leaderboard.mods.selected.name === m.name,
                      '!opacity-20 pointer-events-none': $forbiddenMods(leaderboard.mode.selected.icon, m.icon) }"
            @click="changeValue('mods', index)"
          >
            {{ m.name }}
          </a>
        </div>
        <div class="flex justify-center">
          <a
            v-for="(m, index) in leaderboard.mode.list"
            :key="index"
            class="h-mode mx-3"
            :class="{ '!opacity-80 pointer-events-none': leaderboard.mode.selected.name === m.name,
                      '!opacity-20 pointer-events-none': $forbiddenMode(leaderboard.mods.selected.icon, m.icon) }"
            @click="changeValue('mode', index)"
          >
            <img :src="`assets/icons/mode/${m.icon}.svg`">
          </a>
        </div>
        <div class="flex justify-center">
          <a
            v-for="(s, index) in leaderboard.sort.list"
            :key="index"
            class="h-mode text-sm !px-3"
            :class="{ '!opacity-80 pointer-events-none': leaderboard.sort.selected.name === s.name }"
            @click="changeValue('sort', index)"
          >
            {{ s.name }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaderboardHeader',
  data () {
    return {
      leaderboard: {
        mode: {
          selected: Object,
          list: Array
        },
        mods: {
          selected: Object,
          list: Array
        },
        sort: {
          selected: Object,
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
    this.$emit('input', this.leaderboard)
    this.initLeaderboard(this.leaderboard)
  },
  methods: {
    changeValue (type, index) {
      this.leaderboard[`${type}`].selected = this.leaderboard[`${type}`].list[`${index}`]
      this.$emit('input', this.leaderboard)
    },
    initLeaderboard () {
      this.leaderboard.mode.list = this.$config.mode
      this.leaderboard.mods.list = this.$config.mods
      this.leaderboard.mode.selected = this.leaderboard.mode.list[0]
      this.leaderboard.mods.selected = this.leaderboard.mods.list[0]
      this.leaderboard.sort.selected = this.leaderboard.sort.list[0]
    }
  }
}
</script>

<style lang="postcss">
.h-mode {
  @apply px-2 py-1 transition duration-200 ease-in-out font-semibold opacity-50 cursor-pointer;
}
.h-mode img {
  @apply w-7 h-7;
}
.h-mode:hover {
  @apply opacity-100;
}
.h-header {
  display: flex;
  align-items: center;
  transition: 0.5s ease;
  @apply pb-2;
  @screen md {
    @apply pt-13 pb-16

  }
}
</style>
