<script setup lang="ts">
import type { LeaderboardDataProvider } from '~~/src/adapters/base/client/leaderboard'

const props = defineProps<{
  scores: LeaderboardDataProvider.BeatmapLeaderboard<string>[]
}>()
</script>

<template>
  <table>
    <thead>
      <tr />
    </thead>
    <tbody>
      <tr v-for="(item, index) in props.scores" :key="index">
        <th>
          {{ item.score.score }}
        </th>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>

</style>'
