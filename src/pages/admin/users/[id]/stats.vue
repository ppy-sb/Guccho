<script setup lang="ts">
import type { ModeRulesetScoreStatistic } from '~/def/statistics'
import { Grade } from '~/def/score'

const app = useNuxtApp()
const route = useRoute<'admin-users-id-stats'>()

const fmt = createNumberFormatter()

const id = route.params.id
const user = await app.$client.user.uniqueIdent.query(id)
if (!user) {
  await navigateTo('/admin/users')
}
const [sw, setSw] = useLeaderboardSwitcher()
const recalcingAll = ref(false)

const defStat: ModeRulesetScoreStatistic = {
  totalScore: 0n,
  totalHits: 0n,
  playTime: 0,
  playCount: 0,
  level: 0,
  maxCombo: 0,
  rankedScore: 0n,
  scoreRankComposition: {
    [Grade.SSH]: 0,
    [Grade.SS]: 0,
    [Grade.SH]: 0,
    [Grade.S]: 0,
    [Grade.A]: 0,
    [Grade.B]: 0,
    [Grade.C]: 0,
    [Grade.D]: 0,
    [Grade.F]: 0,
  },
}

const { data: current, refresh } = await app.$client.admin.userManagement.getUserStats.useQuery(() => ({ id, mode: sw.mode, ruleset: sw.ruleset }))

async function recalc() {
  current.value = await app.$client.admin.userManagement.recalcUserStat.mutate({ id, mode: sw.mode, ruleset: sw.ruleset })
}

async function clear() {
  current.value = await app.$client.admin.userManagement.clearUserStat.mutate({ id, mode: sw.mode, ruleset: sw.ruleset })
}
async function clearAll() {
  try {
    await app.$client.admin.userManagement.clearUserAllStats.mutate({ id })
  }
  finally {
    await refresh()
  }
}
async function recalcAll() {
  recalcingAll.value = true
  try {
    await app.$client.admin.userManagement.recalcUserAllStats.mutate({ id })
    // Re-fetch the current stats after recalculating all
    await refresh()
  }
  finally {
    recalcingAll.value = false
  }
}
</script>

<template>
  <div class="flex flex-col max-w-screen-sm mx-auto">
    <h1 class="mb-4 text-2xl font-bold">
      User Stats
    </h1>
    <div class="mb-4">
      <span>Quick actions</span>
      <div class="flex gap-2">
        <button class="btn btn-sm btn-shadow" :disabled="recalcingAll" @click="recalcAll">
          recalculate all stats
          <i v-if="recalcingAll" :class="{ loading: recalcingAll }" />
        </button>
        <button class="btn btn-sm btn-shadow btn-error" @click="clearAll">
          clear all stats
        </button>
      </div>
    </div>
    <div class="p-2 my-2 border rounded-lg bg-base-100 w-full max-w-md">
      <app-mode-switcher
        :model-value="sw"
        class="max-w-min"
        @update:model-value="setSw"
      />
      <dl v-if="current" class="stats_dl mt-4">
        <dt>ranked score</dt>
        <dd>
          <div class="text-end">
            {{ fmt(current.rankedScore) }}
          </div>
        </dd>
        <dt>total score</dt>
        <dd>
          <div class="text-end">
            {{ fmt(current.totalScore) }}
          </div>
        </dd>
        <dt>total hits</dt>
        <dd>
          <div class="text-end">
            {{ fmt(current.totalHits) }}
          </div>
        </dd>
        <dt>play time</dt>
        <dd>
          <div class="text-end">
            {{ fmt(current.playTime) }}
          </div>
        </dd>
        <dt>play count</dt>
        <dd>
          <div class="text-end">
            {{ fmt(current.playCount) }}
          </div>
        </dd>
        <dt>max combo</dt>
        <dd>
          <div class="text-end">
            {{ fmt(current.maxCombo) }}
          </div>
        </dd>
        <template v-for="_, key in defStat.scoreRankComposition" :key="key">
          <dt>rank.{{ key }}</dt>
          <dd>
            <div class="text-end">
              {{ fmt(current.scoreRankComposition[key]) }}
            </div>
          </dd>
        </template>
      </dl>
    </div>
    <div class="flex justify-between w-full max-w-sm">
      <button class="btn btn-shadow btn-sm btn-error" @click="clear">
        clear
      </button>
      <button class="btn btn-shadow btn-sm btn-accent" @click="recalc">
        recalc
      </button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.stats_dl {
  @apply grid grid-cols-2 gap-x-4 gap-y-2 items-baseline;
  dt {
    @apply text-sm font-medium text-gray-500 dark:text-gray-400 text-left;
  }
  dd {
    @apply text-base font-semibold text-gray-900 dark:text-gray-100 mb-2;
  }
}
</style>
