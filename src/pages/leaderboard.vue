<template>
  <div class="flex flex-col h-full pt-16 leaderboard custom-container md:pt-0">
    <header-leaderboard v-model="selection" @input="getLeaderboard" />

    <div
      class="container flex mx-auto grow"
      :class="{
        content: result.length,
      }"
    >
      <template v-if="result.length !== 0">
        <div class="relative mx-auto overflow-hidden xl:rounded-lg">
          <fetch-overlay :fetching="fetching" />
          <div class="px-8 py-4">
            <div class="relative overflow-x-auto">
              <table class="table text-sm border-separate whitespace-nowrap">
                <thead class="rounded-lg">
                  <tr class="text-sm font-light">
                    <th>rank</th>
                    <th>flag</th>
                    <th>player</th>
                    <th class="px-4 text-xs font-semibold text-center">
                      {{ selection.rankingSystem?.name }}
                    </th>
                    <th class="px-4 text-xs font-medium text-center">
                      Accuracy
                    </th>
                    <th class="px-4 text-xs font-medium text-center">
                      Play Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <leaderboard-user-table
                    v-for="(item, index) in table"
                    :key="index"
                    :user="item.user"
                    :place="item.rank"
                    :sort="selection.rankingSystem?.value"
                  />
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
import result from 'postcss/lib/result'
import { Mode, Ruleset, RankingSystem } from '../types/common'
import { useClient } from '#imports'
export type LeaderboardItemType = {
  user: {
    id: unknown;
    ingameId: number;
    name: string;
    safeName: string;
    flag: string;
    avatarUrl: string;
    inThisLeaderboard: Record<string, number | bigint>;
  };
  rank: bigint;
}
type EmitType = {
  mode?: { value: Mode, name: string }
  ruleset?: { value: Ruleset, name: string }
  rankingSystem?: { value: RankingSystem, name: string }
}
const selection = reactive<EmitType>({})
const table = ref<Array<LeaderboardItemType>>([])
const fetching = ref(false)
const page = ref(0)
const perPage = ref(50)

const client = useClient()
const getLeaderboard = async (selection: EmitType) => {
  if (!selection.mode || !selection.ruleset || !selection.rankingSystem) {
    return
  }
  console.log(selection)
  const result = await client.query('leaderboard', {
    mode: selection.mode.value,
    ruleset: selection.ruleset.value,
    rankingSystem: selection.rankingSystem.value,
    page: page.value,
    pageSize: perPage.value
  })

  table.value = result
}
</script>

<style scoped lang="postcss">
.content {
  @screen md {
    margin-top: -3rem
  }
}
</style>

<style>
.table {
  border-spacing: 0 2px
}

.table tr {
  border-radius: 22px
}
</style>
