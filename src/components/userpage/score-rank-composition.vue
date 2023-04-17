<script setup lang="ts">
import userpageStore from '~/store/userpage'

const page = userpageStore()

const totalCount = computed(() => {
  return Object.values(page.currentStatistic.scoreRankComposition).reduce((acc, cur) => acc + cur, 0)
})
const fmt = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 9,
})
function percent(num: number) {
  return fmt.format(num)
}
const composition = computed(
  () => page.currentStatistic.scoreRankComposition,
)

function createStyleObject(count: number) {
  return {
    width: percent(count / totalCount.value),
  }
}
</script>

<template>
  <VDropdown :triggers="['hover', 'focus', 'click']">
    <div v-if="totalCount" class="relative">
      <div class="multi-progress-bar-container bg-emerald-200">
        <div
          v-if="composition.ssh"
          :style="createStyleObject(composition.ssh)"
          class="multi-progress-bar bg-gray-500"
        />
        <div
          v-if="composition.ss"
          :style="createStyleObject(composition.ss)"
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
        <div v-if="composition.ssh">
          SSH x {{ composition.ssh }}
        </div>
        <div v-if="composition.ss">
          SS x {{ composition.ss }}
        </div>
        <div v-if="composition.sh">
          SH x {{ composition.sh }}
        </div>
        <div v-if="composition.s">
          S x {{ composition.s }}
        </div>
        <div v-if="composition.a">
          A x {{ composition.a }}
        </div>
        <div v-if="composition.b">
          B x {{ composition.b }}
        </div>
        <div v-if="composition.c">
          C x {{ composition.c }}
        </div>
        <div v-if="composition.d">
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
    @apply shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center;
  }
}
</style>
