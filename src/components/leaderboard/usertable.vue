<template>
  <tr class="bg-wewak-300 dark:bg-wewak-800 rounded-md text-kimberly-900 dark:text-kimberly-100 font-medium">
    <td class="px-4 font-bold py-3">
      <p class="text-kimberly-900 dark:text-kimberly-100">
        #{{ props.rank.rank }}
      </p>
    </td>
    <td>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <img
            class="h-6 w-auto"
            :src="$getFlagURL(props.user.flag)"
          >
        </div>
        <div class="ml-3">
          <p class="font-medium text-kimberly-900 dark:text-kimberly-100">
            <user-card :user="user" :href="'/user/' + props.user.id" />
          </p>
        </div>
      </div>
    </td>
    <td class="text-center font-bold">
      <template v-if="sort.selected.icon === 'pp'">
        {{ $addCommas(props.user.pp) }}pp
      </template>
      <template v-else-if="sort.selected.icon === 'acc'">
        {{ props.user.acc }}%
      </template>
      <template v-else>
        {{ $scoreFormat(props.user[`${sort.selected.icon}`]) }}
      </template>
    </td>
    <td class="text-center opacity-80">
      {{ props.user.acc }}%
    </td>
    <td class="text-center opacity-80">
      {{ props.user.plays }}
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { User, UserModeRulesetStatistics, BaseRank } from '~/prototyping/types/user'

const props = defineProps<{
  user: User<string>,
  ruleset: UserModeRulesetStatistics,
  rank: BaseRank,
  sort: Record<string, any>
}>()
</script>
