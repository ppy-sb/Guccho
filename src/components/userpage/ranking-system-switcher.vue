<template>
  <section class="w-full pt-4 mx-auto ">
    <t-tabs v-slot="{select}" v-model="tab" variant="bordered">
      <t-tab disabled class="f-tab grow p-0 m-0" />
      <!-- <t-tab class="f-tab" value="Timeline">
        Timeline
      </t-tab> -->

      <t-tab
        v-for="(stats, key) of tabs"
        :key="`user-tab-${key}`"
        class="f-tab"
        :value="key"
      >
        {{ rankingSystem[key].name }}
      </t-tab>

      <div
        class="tab f-tab tab-bordered"
        :class="{
          'tab-active': Object.keys(dropdown).includes(tab)
        }"
      >
        <div class="dropdown dropdown-end dropdown-hover">
          <div tabindex="0">
            Other Ranks
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu p-2 shadow bg-base-100 rounded-box rounded-3xl w-52 z-50"
          >
            <li v-for="(stats, key) of dropdown" :key="`user-tab-${key}`">
              <a class="z-50" @click="select(key)">{{ rankingSystem[key].name }}</a>
            </li>

            <li><a>Acc Only(v2)</a></li>
          </ul>
        </div>
      </div>
      <t-tab disabled class="f-tab grow p-0 m-0" />
    </t-tabs>
  </section>
</template>

<script setup>
import { useAppConfig } from 'nuxt/app'

const tab = inject('rankingSystem')
// const currentStatistic = inject('selectedStatisticsData')
const { rankingSystem } = useAppConfig()

const rankingSystemEntries = computed(() => Object.entries(rankingSystem))

const filter = showType => rankingSystemEntries.value.reduce((acc, [key, value]) => {
  if (value.show === showType) { acc[key] = value }
  return acc
}, {})

const tabs = computed(() => filter('tab'))
const dropdown = computed(() => filter('dropdown'))
</script>

<style lang="postcss" scoped>
.f-tab {
  @apply tab-sm sm:tab-sm md:tab-lg;
}
</style>
