<template>
  <tr class="font-medium">
    <th class="px-4 py-3 font-bold">
      <p class="text-kimberly-900 dark:text-kimberly-100">
        #{{ props.place }}
      </p>
    </th>
    <th>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <img
            class="w-auto h-6"
            :src="getFlagURL(props.user.flag)"
          >
        </div>
      </div>
    </th>
    <th>
      <div class="flex gap-2 items-center ">
        <div class="aspect-square mask mask-squircle flex">
          <img class="m-auto" :src="user.avatarUrl" :alt="user.name" width="30">
        </div>
        {{ user.name }}
      </div>
    </th>
    <td class="font-bold text-right">
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
    <td class="text-right opacity-80">
      {{ formatter.format((props.user.inThisLeaderboard.accuracy as number) / 100) }}
    </td>
    <td class="text-right opacity-80">
      {{ addCommas(props.user.inThisLeaderboard.playCount) }}
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { addCommas, getFlagURL, scoreFormat } from '~/common/varkaUtils'
import { RankingSystem } from '~/types/common'
import { LeaderboardItem } from '~/types/leaderboard'
import { IdType } from '~/server/trpc/trpc'

const option = {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}
const formatter = new Intl.NumberFormat(undefined, option)

const props = defineProps<{
  user: LeaderboardItem<IdType>['user'],
  place: number,
  sort: RankingSystem
}>()
</script>
