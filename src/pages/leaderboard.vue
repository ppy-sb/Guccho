<template>
  <div class="flex flex-col h-full pt-16 leaderboard custom-container md:pt-0">
    <header-leaderboard v-model.lazy="selection" @input="fetchLeaderboard" />

    <div
      class="container flex mx-auto grow"
      :class="{
        content: result.length
      }"
    >
      <template v-if="result.length !== 0">
        <div
          class="relative mx-auto overflow-hidden xl:rounded-lg"
        >
          <fetch-overlay :fetching="fetching" />
          <div class="px-8 py-4">
            <div class="relative overflow-x-auto">
              <table
                class="table text-sm border-separate whitespace-nowrap"
              >
                <thead class="text-kimberly-200">
                  <tr class="text-sm font-light">
                    <th />
                    <th class="w-full" />
                    <th class="px-4 text-xs font-semibold text-center rounded-lg">
                      {{ selection.sort.selected.name }}
                    </th>
                    <th class="px-4 text-xs font-medium text-center opacity-60">
                      Accuracy
                    </th>
                    <th class="px-4 text-xs font-medium text-center opacity-60">
                      Play Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <leaderboard-user-table v-for="(u, index) in result" :key="index" :user="u" :place="index+1" :sort="selection.sort" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="pb-10 my-auto text-kimberly-900 dark:text-kimberly-100 grow">
          <h1 class="text-xl font-semibold text-center">
            No one played this mode yet.
          </h1>
          <h2 class="text-sm font-semibold text-center opacity-60">
            Maybe you will be the first one? Go for it.
          </h2>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
const selection = reactive({})
const result = ref([])
const fetching = ref(false)

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
</script>

<style scoped lang="postcss">
.content {
  @screen md {
    margin-top: -3rem;
  }
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
