<template>
  <div class="h-header bg-hsl-h3">
    <div class="container sm:grid items-center grid-cols-2 text-center text-white">
      <HeaderSimpleTitlewithsub
        title="Leaderboard"
        :subtitle="`${leaderboard.mode.selected.name} - ${leaderboard.mods.selected.name}`"
        class="text-left"
      />

      <div class="grid mt-4 sm:mt-0 gap-1 sm:gap-1">
        <div class="flex justify-center sm:justify-end">
          <a
            v-for="(m, index) in leaderboard.mode.list"
            :key="index"
            class="h-mode"
            :class="{ '!opacity-80 pointer-events-none': leaderboard.mode.selected.name === m.name,
                      '!opacity-20 pointer-events-none': $forbiddenMode(leaderboard.mods.selected.icon, m.icon) }"
            @click="changeValue('mode', index)"
          >
            <img :src="require(`~/assets/icons/mode/${m.icon}.svg`)">
          </a>
        </div>
        <div class="flex justify-center sm:justify-end">
          <a
            v-for="(m, index) in leaderboard.mods.list"
            :key="index"
            class="h-mode"
            :class="{ '!opacity-80 pointer-events-none': leaderboard.mods.selected.name === m.name,
                      '!opacity-20 pointer-events-none': $forbiddenMods(leaderboard.mode.selected.icon, m.icon) }"
            @click="changeValue('mods', index)"
          >
            {{ m.name }}
          </a>
        </div>
        <div class="flex justify-center sm:justify-end">
          <a
            v-for="(s, index) in leaderboard.sort.list"
            :key="index"
            class="h-mode text-sm"
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
              name: 'Perfomance',
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
      this.leaderboard.mode.list = this.$store.state.mode.list
      this.leaderboard.mods.list = this.$store.state.mods.list
      this.leaderboard.mode.selected = this.leaderboard.mode.list[0]
      this.leaderboard.mods.selected = this.leaderboard.mods.list[0]
      this.leaderboard.sort.selected = this.leaderboard.sort.list[0]
    }
  }
}
</script>

<style>
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
  height: 14rem;
  transition: 0.5s ease;
}
@media only screen and (min-width: 1024px) {
  .h-header {
    height: 16rem;
    margin-bottom: -4rem;
  }
}
</style>
