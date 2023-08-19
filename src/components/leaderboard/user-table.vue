<script lang="ts" setup>
import type { inferRouterOutputs } from '@trpc/server'

import type { LeaderboardRankingSystem } from '~/def/common'
import type { ComponentLeaderboard } from '~/def/leaderboard'
import type { AppRouter } from '~/server/trpc/routers'
import { Rank } from '~/def'

type RouterOutput = inferRouterOutputs<AppRouter>

type Leaderboard = NonNullable<RouterOutput['rank']['leaderboard']>[number]
const props = defineProps<{
  user: Leaderboard['user']
  inThisLeaderboard: ComponentLeaderboard<string>['inThisLeaderboard']
  sort: LeaderboardRankingSystem
}>()
const addCommas = createNumberFormatter()
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
      <p class="text-gbase-900 dark:text-gbase-100" :data-rank="props.inThisLeaderboard.rank?.toString()">
        #{{ props.inThisLeaderboard.rank }}
      </p>
    </th>
    <th>
      <div class="flex justify-center items-center w-full">
        <div class="flex-shrink-0">
          <img class="w-6" :src="getFlagURL(props.user.flag)">
        </div>
      </div>
    </th>
    <th>
      <div class="flex gap-2 items-center">
        <div class="aspect-square mask mask-squircle w-7 overflow-hidden object-cover flex">
          <img
            class="m-auto"
            :src="user.avatarSrc"
            :alt="user.name"
            width="30"
          >
        </div>
        <nuxt-link-locale
          :to="{ name: 'user-handle', params: { handle: `@${user.safeName}` } }"
          :class="useUserRoleColor(user)"
        >
          {{ user.name }}
        </nuxt-link-locale>
      </div>
    </th>
    <td class="font-bold text-right">
      <template v-if="sort === Rank.PPv2">
        {{ addCommas(props.inThisLeaderboard[Rank.PPv2] || 0) }}pp
      </template>
      <template v-else-if="sort === Rank.PPv1">
        {{ addCommas(props.inThisLeaderboard[Rank.PPv1] || 0) }}pp
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

<style scoped lang="scss">
@import '~/assets/styles/text-shadow';
tr [data-rank="1"] {
  @apply text-yellow-100 dark:text-yellow-600;
  @apply shadow-yellow-800/80 dark:shadow-yellow-200/30;
  @extend .text-shadow-sm;
}
tr [data-rank="2"] {
  @apply text-gray-50 dark:text-white;
  @apply shadow-gray-600/70 dark:shadow-gray-400/30;
  @extend .text-shadow-sm;
}
tr [data-rank="3"] {
  @apply text-orange-50 dark:text-orange-400;
  @apply shadow-yellow-700/80 dark:shadow-yellow-500/20;
  @extend .text-shadow-sm;
}
</style>
