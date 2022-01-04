<template>
  <div id="leaderboard">
    <HeaderLeaderboard v-model="selection" @change="listenSelectionChange" />

    <div class="container">
      <div
        class="relative px-8 py-4 mx-auto mt-4 overflow-hidden transition-all lg:rounded-md bg-hsl-b4"
      >
        <div class="relative overflow-x-auto">
          <table
            class="relative table w-full overflow-x-auto text-sm border-separate table-auto whitespace-nowrap"
          >
            <thead class="text-gray-200">
              <tr class="font-semibold">
                <th class="w-full" />
                <th class="px-4 text-sm text-center rounded-lg">
                  Perfomance Point
                </th>
                <th class="px-4 text-sm text-center opacity-60">
                  Accuracy
                </th>
                <th class="px-4 text-sm text-center opacity-60">
                  Playcount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr />
            </tbody>
          </table>
          <template v-if="fetching == true">
            <div class="flex justify-center col-span-3 text-white">
              <svg
                class="w-12 h-12 animate-spin"
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
          </template>
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
    this.$store.commit('changeThemeHue', 10)
    this.fetchLeaderboard()
  },
  methods: {
    listenSelectionChange () {
      return this.fetchLeaderboard()
    },
    fetchLeaderboard () {
      this.fetching = true
      this.$axios.get(`https://api.${process.env.baseUrl}/get_leaderboard`).then((response) => {
        this.result = response.data
      }).catch((error) => {
        console.log(error)
      }).finally(() => {
        this.fetching = false
      })
    }
  }
}
</script>
