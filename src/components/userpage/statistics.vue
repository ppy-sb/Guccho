<script setup lang="ts">
import type { Mode, RankingSystem, Ruleset } from '~~/src/types/common'
import type { UserModeRulesetStatistics } from '~~/src/types/statistics'

const data = inject<UserModeRulesetStatistics<unknown, Mode, Ruleset, RankingSystem>>('selectedStatisticsData')
</script>

<template>
  <div v-if="data" class="card">
    <!-- <div class="radial-progress mx-auto text-primary-content bg-primary/20 border-8 border-primary/20" style="--value:70; --size:12rem; --thickness: 0.66em;">
      <div class="text-3xl">
        Lv. 69
      </div>
    </div> -->

    <div class="card-body p-0 md:p-4 xl:p-3">
      <div class="stats bg-transparent drop-shadow-xl">
        <div class="stat">
          <div class="stat-title">
            Level
          </div>
          <div class="stat-value">
            {{ Math.floor(data.level) }}
          </div>
          <div class="stat-desc flex flex-col">
            >> {{ (data.level % 1).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 }) }}
            <progress
              class="progress progress-primary"
              :value="data.level % 1"
              max="1"
            />
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            Ranked Score
          </div>
          <div class="stat-value">
            4,200
          </div>
          <div class="stat-desc">
            ↗︎ 400 (22%)
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">
            New Registers
          </div>
          <div class="stat-value">
            1,200
          </div>
          <div class="stat-desc">
            ↘︎ 90 (14%)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
