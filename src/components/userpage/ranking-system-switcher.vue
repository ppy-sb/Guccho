<template>
  <section class="container pt-4 mx-auto">
    <t-tabs v-model="tab" variant="bordered">
      <t-tab disabled class="f-tab grow p-0 m-0" />
      <t-tab class="f-tab" value="Timeline">
        Timeline
      </t-tab>
      <template v-for="(stats, key) of currentStatistic.ranking">
        <t-tab
          v-if="rankingSystem[key].show === 'tab'"
          :key="`user-tab-${key}`"
          class="f-tab"
          :value="key"
        >
          {{ rankingSystem[key].name }}
        </t-tab>
      </template>
      <div class="tab f-tab tab-bordered">
        <div class="dropdown dropdown-end dropdown-hover">
          <div tabindex="0">
            Other Ranks
          </div>
          <ul
            tabindex="0"
            class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <template v-for="(stats, key) of currentStatistic.ranking">
              <li v-if="rankingSystem[key].show === 'dropdown'" :key="`user-tab-${key}`">
                <a>{{ rankingSystem[key].name }}</a>
              </li>
            </template>
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
const currentStatistic = inject('selectedStatisticsData')
const { rankingSystem } = useAppConfig()
</script>

<style lang="postcss" scoped>
.f-tab {
  @apply tab-sm sm:tab-sm md:tab-lg;
}
</style>
