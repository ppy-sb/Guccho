<template>
  <div id="leaderboard">
    <header-leaderboard v-model.lazy="selection" @input="fetchLeaderboard" />

    <div class="container">
      <div
        class="bg-hsl-b5 lg:rounded-md relative overflow-hidden mx-auto mt-4 box"
      >
        <fetch-overlay :fetching="fetching" />
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
                  <leaderboard-user-table v-for="(u, index) in result" :key="index" :user="u" :place="index+1" :sort="selection.sort" />
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
    // this.$store.commit('changeThemeHue', 80)
  },
  methods: {
    fetchLeaderboard () {
      this.fetching = true
      // TODO: migrate to useFetch
      // this.$axios
      //   .get(`https://api.${'1'}/get_leaderboard`, {
      //     params: {
      //       mode: this.$modeToGulag(this.selection.mode.selected.icon, this.selection.mods.selected.icon)
      //     }
      //   })
      //   .then((response) => {
      //     this.result = response.data.leaderboard
      //   })
      //   .catch((error) => {
      //     this.$toast.show({
      //       type: 'danger',
      //       message: error
      //     })
      //   })
      //   .finally(() => {
      //     this.fetching = false
      //   })
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
