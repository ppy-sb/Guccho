<script setup lang="ts">
import type { Ref } from 'vue'
import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'
import type { UserModeRulesetStatistics } from '~/types/statistics'
import { createScoreFormatter, toDuration } from '~/common/varkaUtils'

const chars = [...[...Array(10).keys()].map(String), ',', '.', 'K', 'M', 'B', 'T', '-']

const data = inject('user.statistics') as Ref<UserModeRulesetStatistics<unknown, Mode, Ruleset, OverallLeaderboardRankingSystem>>
const scoreFmt = createScoreFormatter({ notation: 'compact', maximumFractionDigits: 2 })
const deferredRender = ref({ ...data.value })
const playTime = computed(() => deferredRender?.value ? toDuration(new Date(deferredRender.value.playTime * 1000), new Date(0)) : { hours: 0, minutes: 0, seconds: 0 })
watch(data, () => {
  setTimeout(() => {
    deferredRender.value = { ...data.value }
  }, 0)
})
</script>

<template>
  <div class="card">
    <!-- <div class="radial-progress mx-auto text-primary-content bg-primary/20 border-8 border-primary/20" style="--value:70; --size:12rem; --thickness: 0.66em;">
      <div class="text-3xl">
        Lv. 69
      </div>
    </div> -->

    <div class="card-body p-0 md:p-4 xl:p-3">
      <div class="stats bg-transparent grid drop-shadow-xl md:grid-cols-3 stats-vertical md:stats-horizontal">
        <div class="stat">
          <div class="stat-title">
            Level
          </div>
          <div class="stat-value">
            <roller
              :char-set="chars"
              :value="(Math.floor(deferredRender.level) || 0).toString()"
            />
          </div>
          <div class="stat-desc flex flex-col">
            <div class="flex gap-1 items-center">
              >> <roller
                :char-set="chars"
                :value="(deferredRender.level % 1).toLocaleString('en-US', { style: 'percent', maximumFractionDigits: 2 }).slice(0, -1)"
                default-value="0"
              /> %
            </div>
            <progress
              class="progress progress-primary"
              :value="deferredRender.level % 1"
              max="1"
            />
          </div>
        </div>
        <div v-if="deferredRender.totalScore" class="stat">
          <div class="stat-title">
            Score
          </div>
          <div class="stat-value">
            <roller
              :char-set="chars"
              :value="scoreFmt(deferredRender.totalScore.score as bigint)"
              default-value="-"
            />
          </div>
          <div class="stat-desc flex gap-1 items-center">
            <roller
              :char-set="chars"
              :value="scoreFmt(deferredRender.playCount)"
            /> plays
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            Play
          </div>
          <div class="stat-value flex gap-1 items-center">
            <roller
              :char-set="chars"
              :value="scoreFmt(deferredRender.totalHits)"
              default-value="-"
            />
            TTH
          </div>
          <div class="stat-desc flex gap-2">
            <!-- {{ playTime.hours }} H, {{ playTime.minutes }} M, {{ playTime.seconds }} S -->
            <div>
              <span class="countdown font-mono text-lg">
                <span :style="`--value:${playTime.hours};`" />
              </span>
              hours
            </div>
            <div>
              <span class="countdown font-mono text-lg">
                <span :style="`--value:${playTime.minutes};`" />
              </span>
              min
            </div>
            <div>
              <span class="countdown font-mono text-lg">
                <span :style="`--value:${playTime.seconds};`" />
              </span>
              sec
            </div>
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
