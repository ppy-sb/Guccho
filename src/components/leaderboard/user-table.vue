<script lang="ts" setup>
import {
  createAddCommasFormatter,
  createScoreFormatter,
  getFlagURL,
} from '~/common/varkaUtils'
import type { LeaderboardRankingSystem } from '~/types/common'
import type { ComponentLeaderboard, Leaderboard } from '~/types/leaderboard'
const props = defineProps<{
  user: Leaderboard<string>['user']
  inThisLeaderboard: ComponentLeaderboard<string>['inThisLeaderboard']
  sort: LeaderboardRankingSystem
}>()
const addCommas = createAddCommasFormatter()
const scoreFormat = createScoreFormatter()
const option = {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}
const formatter = new Intl.NumberFormat(undefined, option)
</script>

<template>
  <tr class="font-medium">
    <th class="px-4 py-3 font-bold">
      <p class="text-kimberly-900 dark:text-kimberly-100">
        #{{ props.inThisLeaderboard.rank }}
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
        <div class="aspect-square mask mask-squircle overflow-hidden object-cover flex">
          <img
            class="m-auto"
            :src="user.avatarSrc"
            :alt="user.name"
            width="30"
          >
        </div>
        <nuxt-link
          :to="{ name: 'user-handle', params: { handle: `@${user.safeName}` } }"
          :class="useUserRoleColor(user)"
        >
          {{ user.name }}
        </nuxt-link>
      </div>
    </th>
    <td class="font-bold text-right">
      <template v-if="sort === 'ppv2'">
        {{ addCommas(props.inThisLeaderboard.ppv2 || 0) }}pp
      </template>
      <template v-else-if="sort === 'ppv1'">
        {{ addCommas(props.inThisLeaderboard.ppv1 || 0) }}pp
      </template>
      <template v-else-if="sort in props.inThisLeaderboard">
        {{ scoreFormat(props.inThisLeaderboard[sort] || 0) }}
      </template>
    </td>
    <td class="text-right opacity-80">
      {{ formatter.format((props.inThisLeaderboard.accuracy || 0) / 100) }}
    </td>
    <td class="text-right opacity-80">
      {{ addCommas(props.inThisLeaderboard.playCount || 0) }}
    </td>
  </tr>
</template>
