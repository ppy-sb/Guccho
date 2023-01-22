<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { UserModeRulesetStatistics } from '~/types/statistics'
import type { OverallLeaderboardRankingSystem } from '~/types/common'

const currentRankingSystem = inject('user.statistics') as ComputedRef<UserModeRulesetStatistics<OverallLeaderboardRankingSystem>>

const totalCount = computed(() => {
  return Object.values(currentRankingSystem.value.scoreRankComposition).reduce((acc, cur) => acc + cur, 0)
})
const fmt = new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 9 })
const percent = (num: number) => fmt.format(num)
const composition = computed(() => currentRankingSystem.value.scoreRankComposition)

const createStyleObject = (count: number) => ({
  width: percent(count / totalCount.value),
})
</script>

<template>
  <VDropdown :triggers="['hover', 'focus', 'click']">
    <div v-if="totalCount" class="relative">
      <div class="multi-progress-bar-container bg-emerald-200">
        <div
          v-if="composition.xh"
          :style="createStyleObject(composition.xh)"
          class="multi-progress-bar bg-gray-500"
        />
        <div
          v-if="composition.x"
          :style="createStyleObject(composition.x)"
          class="multi-progress-bar bg-yellow-500"
        />
        <div
          v-if="composition.sh"
          :style="createStyleObject(composition.sh)"
          class="multi-progress-bar bg-gray-400"
        />
        <div
          v-if="composition.s"
          :style="createStyleObject(composition.s)"
          class="multi-progress-bar bg-orange-400"
        />
        <div
          v-if="composition.a"
          :style="createStyleObject(composition.a)"
          class="multi-progress-bar bg-lime-500"
        />
        <div
          v-if="composition.b"
          :style="createStyleObject(composition.b)"
          class="multi-progress-bar bg-blue-500"
        />
        <div style="width: 25%" class="multi-progress-bar bg-emerald-500" />
      </div>
    </div>
    <template #popper>
      <div class="flex gap-2 p-2">
        <div v-if="composition.xh">
          SSH x {{ composition.xh }}
        </div>
        <div v-if="composition.x">
          |
          SS x {{ composition.x }}
        </div>
        <div v-if="composition.sh">
          |
          SH x {{ composition.sh }}
        </div>
        <div v-if="composition.s">
          |
          S x {{ composition.s }}
        </div>
        <div v-if="composition.a">
          |
          A x {{ composition.a }}
        </div>
        <div v-if="composition.b">
          |
          B x {{ composition.b }}
        </div>
        <div v-if="composition.c">
          |
          C x {{ composition.c }}
        </div>
        <div v-if="composition.d">
          |
          D x {{ composition.d }}
        </div>
      </div>
    </template>
  </VDropdown>
</template>

<style scoped lang="postcss">
.multi-progress-bar-container {
  @apply overflow-hidden h-4 mb-4 text-xs flex rounded-xl;
  .multi-progress-bar {
    @apply shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center
  }
}
</style>
