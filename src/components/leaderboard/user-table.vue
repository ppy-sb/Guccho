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
          <img class="w-auto h-6" :src="getFlagURL(props.user.flag)">
        </div>
      </div>
    </th>
    <th>
      <div class="flex gap-2 items-center">
        <div class="aspect-square mask mask-squircle flex">
          <img class="m-auto" :src="user.avatarUrl" :alt="user.name" width="30">
        </div>
        {{ user.name }}
      </div>
    </th>
    <td class="font-bold text-right">
      <template v-if="sort === 'ppv2'">
        {{ addCommas(props.user.inThisLeaderboard.ppv2 || 0) }}pp
      </template>
      <template v-else-if="sort === 'ppv1'">
        {{ addCommas(props.user.inThisLeaderboard.ppv1 || 0) }}pp
      </template>
      <template v-else-if="sort in props.user.inThisLeaderboard">
        {{ scoreFormat(props.user.inThisLeaderboard[sort] || 0) }}
      </template>
    </td>
    <td class="text-right opacity-80">
      {{ formatter.format((props.user.inThisLeaderboard.accuracy || 0) / 100) }}
    </td>
    <td class="text-right opacity-80">
      {{ addCommas(props.user.inThisLeaderboard.playCount || 0) }}
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { addCommas, getFlagURL, scoreFormat } from '~/common/varkaUtils'
import { RankingSystem } from '~/types/common'
import { IdType } from '~/server/trpc/config'
import { ComponentLeaderboardItem } from '~/types/leaderboard'

const option = {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}
const formatter = new Intl.NumberFormat(undefined, option)

const props = defineProps<{
  user: ComponentLeaderboardItem<IdType>['user'],
  place: number | bigint,
  sort: RankingSystem
}>()
</script>
