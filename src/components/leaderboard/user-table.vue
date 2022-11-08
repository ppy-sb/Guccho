<template>
  <tr class="font-medium bg-wewak-300 dark:bg-wewak-800 rounded-md text-kimberly-900 dark:text-kimberly-100">
    <td class="px-4 py-3 font-bold">
      <p class="text-kimberly-900 dark:text-kimberly-100">
        #{{ props.place }}
      </p>
    </td>
    <td>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <img
            class="w-auto h-6"
            :src="getFlagURL(props.user.flag)"
          >
        </div>
        <div class="ml-3">
          <p class="font-medium text-kimberly-900 dark:text-kimberly-100">
            <!-- <user-card :user="user" :href="'/user/' + props.user.id" /> -->
          </p>
        </div>
      </div>
    </td>
    <td>
      <div class="flex gap-2 items-center">
        <img :src="user.avatarUrl" :alt="user.name" width="30">{{ user.name }}
      </div>
    </td>
    <td class="font-bold text-center">
      <template v-if="sort === 'ppv2'">
        {{ addCommas(props.user.inThisLeaderboard.ppv2) }}pp
      </template>
      <template v-else-if="sort === 'ppv1'">
        {{ addCommas(props.user.inThisLeaderboard.ppv1) }}pp
      </template>
      <template v-else-if="sort in props.user.inThisLeaderboard">
        {{ scoreFormat(props.user.inThisLeaderboard[sort]) }}
      </template>
    </td>
    <td class="text-center opacity-80">
      {{ formatter.format((props.user.inThisLeaderboard.accuracy as number) / 100) }}
    </td>
    <td class="text-center opacity-80">
      {{ addCommas(props.user.inThisLeaderboard.playCount) }}
    </td>
  </tr>
</template>

<script lang="ts" setup>

import { UserModeRulesetStatistics } from '~/types/user'
import { addCommas, getFlagURL, scoreFormat } from '~/common/varkaUtils'
import { RankingSystem } from '~~/src/types/common'
import { LeaderboardItemType } from '~~/src/pages/leaderboard.vue'

const option = {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}
const formatter = new Intl.NumberFormat(undefined, option)

const props = defineProps<{
  user: LeaderboardItemType['user'],
  ruleset: UserModeRulesetStatistics,
  place: number,
  sort: RankingSystem
}>()
</script>
