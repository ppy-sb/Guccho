<template>
  <div id="leaderboard">
    <HeaderLeaderboard v-model.lazy="selection" @input="fetchLeaderboard" />

    <div class="container">
      <div
        class="bg-hsl-b5 lg:rounded-md relative overflow-hidden mx-auto mt-4 box"
      >
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-show="fetching"
            class="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full transition-all bg-gray-800 opacity-0 pointer-events-none backdrop-filter bg-opacity-20 backdrop-blur-sm"
          >
            <svg
              class="w-12 h-12 text-white animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </transition>
        <div class="px-8 py-4">
          <div class="relative overflow-x-auto">
            <template v-if="result.length !== 0">
              <table
                class="table text-sm whitespace-nowrap border-separate"
              >
                <thead class="text-gray-200">
                  <tr class="font-light text-sm">
                    <th />
                    <th class="w-full" />
                    <th class="px-4 text-center text-xs rounded-lg font-semibold">
                      {{ selection.sort.selected.name }}
                    </th>
                    <th class="px-4 text-center text-xs opacity-60 font-medium">
                      Accuracy
                    </th>
                    <th class="px-4 text-center text-xs opacity-60 font-medium">
                      Playcount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <LeaderboardUsertable v-for="(u, index) in result" :key="index" :user="u" :place="index+1" :sort="selection.sort" />
                </tbody>
              </table>
            </template>
            <template v-else>
              <div class="text-white h-full mt-5">
                <h1 class="text-center text-xl font-semibold">
                  no one play this mode yet
                </h1>
                <h2 class="text-center font-semibold opacity-60 text-sm">
                  Maybe you are the first one? try play it.
                </h2>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LeaderboardPage',
  data () {
    return {
      selection: {},
      result: [],
      fetching: false
    }
  },
  mounted () {
    this.$store.commit('changeThemeHue', 80)
  },
  methods: {
    fetchLeaderboard () {
      this.fetching = true
      this.$axios
        .get(`https://api.${process.env.baseUrl}/get_leaderboard`, {
          params: {
            mode: this.$modeToGulag(this.selection.mode.selected.icon, this.selection.mods.selected.icon)
          }
        })
        .then((response) => {
          this.result = response.data.leaderboard
          console.log(this.result)
        })
        .catch((error) => {
          console.log(error)
        })
        .finally(() => {
          this.fetching = false
        })
    }
  }
}
</script>

<style scoped>
.box {
  min-height: 8rem;
}

</style>

<style>
.table {
  border-spacing: 0 8px;
}

.table tr {
  border-radius: 22px;
}

tr td:nth-child(n+5),
tr th:nth-child(n+5) {
  border-radius: 0 .3rem .3rem 0;
}

tr td:nth-child(1),
tr th:nth-child(1) {
  border-radius: .3rem 0 0 .3rem;
}
</style>
