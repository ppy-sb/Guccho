<script setup lang="ts">
import type { LeaderboardDataProvider } from '~/adapters/base/client/leaderboard'
import type { RankingSystem } from '~/types/common'
import { createAddCommasFormatter, createPPFormatter } from '~/common/varkaUtils'
const props = withDefaults(defineProps<{
  scores: LeaderboardDataProvider.BeatmapLeaderboard<string>[]
  rankingSystem: RankingSystem
}>(), {
  rankingSystem: 'ppv2',
})
const comma = createAddCommasFormatter()
const pp = createPPFormatter()
</script>

<template>
  <table class="table table-compact table-zebra">
    <thead>
      <tr>
        <th>
          Player
        </th>
        <th class="text-right">
          Rank
        </th>
        <th class="text-right">
          Mods
        </th>
        <th class="text-right">
          Score
        </th>
        <th v-if="rankingSystem === 'ppv2'" class="text-right">
          Performance ( v2 )
        </th>
        <th v-else-if="rankingSystem === 'ppv1'" class="text-right">
          Performance ( v2 )
        </th>
        <th>Played At</th>
        <!-- <th class="text-center">
          Actions
        </th> -->
      </tr>
    </thead>
    <tbody>
      <template v-if="props.scores.length">
        <tr v-for="(item, index) in props.scores" :key="index">
          <th>
            <div class="flex gap-2 items-center">
              <div class="aspect-square mask mask-squircle flex">
                <img
                  class="m-auto"
                  :src="item.user.avatarUrl"
                  :alt="item.user.name"
                  width="30"
                >
              </div>
              <nuxt-link :to="{ name: 'user-handle', params: { handle: item.user.safeName } }" :class="useUserRoleColor(item.user)">
                {{ item.user.name }}
              </nuxt-link>
            </div>
          </th>
          <td class="text-right">
            #{{ index + 1 }}
          </td>
          <td class="text-right font-mono">
            {{ item.score.mods.join(' ') }}
          </td>
          <td class="text-right font-mono">
            {{ comma(item.score.score) }}
          </td>
          <td v-if="rankingSystem === 'ppv2'" class="text-right font-mono">
            {{ pp(item.score.ppv2 || 0) }}
          </td>
          <td v-else-if="rankingSystem === 'ppv1'" class="text-right font-mono">
            {{ pp(item.score.ppv2 || 0) }}
          </td>
          <td class="font-mono">
            {{ item.score.playedAt.toLocaleDateString() }}
            {{ item.score.playedAt.toLocaleTimeString() }}
          </td>
          <!-- <td class="text-center">
            <div class="btn-group">
              <t-button size="sm" variant="ghost">
                download replay
              </t-button>
              <t-button size="sm" variant="ghost">
                detail
              </t-button>
            </div>
          </td> -->
        </tr>
      </template>
      <template v-else>
        <tr>
          <th colspan="6">
            <div class="text-center">
              No Score has been set so far
            </div>
          </th>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<style scoped>

</style>
