<script setup lang="ts">
import type { Ref } from 'vue'
import { OverallLeaderboardRankingSystem, PPRankingSystem, ppRankingSystem } from '~/types/common'
import { PPRank, ScoreRank } from '~/types/statistics'
import type { BaseRank, UserModeRulesetStatistics } from '~/types/statistics'
import { createScoreFormatter, toDuration } from '~/common/varkaUtils'
import type { OverallSwitcherComposableType } from '~~/src/composables/useSwitcher'

const chars = [...[...Array(10).keys()].map(String), ',', '.', 'K', 'M', 'B', 'T', '-', '%']

const data = inject('user.statistics') as Ref<UserModeRulesetStatistics<OverallLeaderboardRankingSystem>>
const currentRankingSystem = inject<BaseRank>('user.currentRankingSystem')
const scoreFmtCompact = createScoreFormatter({ notation: 'compact', maximumFractionDigits: 2 })
const scoreFmt = createScoreFormatter({ notation: undefined })
const deferredRender = reactive({ ...data.value })
const playTime = computed(() => deferredRender ? toDuration(new Date(deferredRender.playTime * 1000), new Date(0)) : { hours: 0, minutes: 0, seconds: 0 })
const switcher = inject<OverallSwitcherComposableType>('switcher')

const sw = computed(() => switcher?.[0].rankingSystem)

watch(data, () => {
  let count = 0
  for (const key in deferredRender) {
    setTimeout(() => {
      // @ts-expect-error it's fine
      deferredRender[key] = data.value[key]
    }, (count += 1) * 100)
  }
})
</script>

<template>
  <div class="card">
    <div class="card-body p-0 md:p-4 xl:p-3">
      <div class="stats bg-transparent stats-vertical md:stats-horizontal">
        <div v-if="currentRankingSystem" class="stat">
          <div class="stat-title">
            Rank
          </div>
          <div class="stat-value flex gap-1 items-center font-mono">
            # <Roller
              :char-set="chars"
              :value="`${Intl.NumberFormat().format(currentRankingSystem.rank || 0)}`"
            />
          </div>
          <div class="stat-desc flex gap-2 items-center">
            country rank: <div class="font-mono flex items-center gap-[0.1em]">
              #
              <Roller
                :char-set="chars"
                :value="`${Intl.NumberFormat().format(currentRankingSystem.countryRank || 0)}`"
              />
            </div>
          </div>
        </div>
        <div v-if="sw" class="stat">
          <div class="stat-title">
            {{ ppRankingSystem.includes(sw as PPRankingSystem) ? 'Performance' : "Score" }}
          </div>
          <!-- TODO add popover -->
          <div class="stat-value">
            <roller
              :char-set="chars"
              class="font-mono"
              :value="ppRankingSystem.includes(sw as PPRankingSystem) ? `${scoreFmt((currentRankingSystem as PPRank)?.performance)}` : scoreFmtCompact((deferredRender[sw as OverallLeaderboardRankingSystem] as ScoreRank).score as bigint)"
              default-value="-"
              :title="deferredRender.totalScore.score"
            />
          </div>
          <div class="stat-desc flex gap-1 items-center">
            <roller
              :char-set="chars"
              class="font-mono"
              :value="scoreFmt(deferredRender.totalHits)"
              default-value="-"
            /> total hits
          </div>
        </div>
        <div class="stat relative">
          <!-- <progress
            class="progress progress-primary pt-[1px] absolute top-0 bottom-0 h-full opacity-10 bg-kimberly-500/30"
            :value="deferredRender.level % 1"
            max="1"
          /> -->
          <div class="stat-title">
            Level
          </div>
          <div class="stat-value">
            <roller
              class="font-mono"
              :char-set="chars"
              :value="Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 2 }).format(deferredRender.level / 100 || 0)"
            />
          </div>
          <div class="stat-desc invisible">
            1
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            Play Count
          </div>
          <div class="stat-value flex gap-1 items-center">
            <roller
              class="font-mono"
              :char-set="chars"
              :value="scoreFmt(deferredRender.playCount)"
            />
          </div>
          <div class="stat-desc flex gap-2">
            {{ playTime.hours }} H, {{ playTime.minutes }} M, {{ playTime.seconds }} S
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            Max Combo
          </div>
          <div class="stat-value flex gap-1 items-center">
            <roller
              class="font-mono"
              :char-set="chars"
              :value="scoreFmt(deferredRender.maxCombo)"
            /> <span class="font-normal">x</span>
          </div>
          <div class="stat-desc invisible">
            1
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
::-webkit-progress-value {
  transition: width 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>

<style scoped lang="postcss">
.stats > .stat {
  border: 0;
}
.stat-value,
.stat-desc {
  @apply flex;
  .roller {
    @apply flex-nowrap;
  }
}
</style>
