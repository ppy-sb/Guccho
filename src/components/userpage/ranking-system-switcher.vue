<script setup lang="ts">
// follow server
import { useAppConfig } from '#app'
import { computed, inject } from 'vue'

import { useAdapterConfig } from '#imports'
import type { SwitcherComposableType } from '~/composables/useSwitcher'
import { RankingSystem } from '~/types/common'

const { supportedRankingSystems } = await useAdapterConfig()

const config = useAppConfig()
const rankingSystem = config.rankingSystem

const [switcher, setSwitcher] = inject('switcher') as SwitcherComposableType

interface RankConf {
  userpage: {
    show: string
  }
  name: string
  icon: string
}
type Entry = [keyof typeof rankingSystem, RankConf]
const rankingSystemEntries = computed(() => Object.entries(rankingSystem) as Entry[])

const filter = (showType: 'tab' | 'dropdown') =>
  rankingSystemEntries.value.reduce<
  Partial<
  Record<keyof typeof rankingSystem, RankConf>
  >
  >((acc, [key, value]) => {
    if (value.userpage.show !== showType)
      return acc
    if (!supportedRankingSystems.includes(key))
      return acc
    acc[key] = value
    return acc
  }, {})
const tabs = computed(() => filter('tab'))
const dropdown = computed(() => filter('dropdown'))
</script>

<template>
  <section class="w-full pt-4 mx-auto ">
    <t-tabs
      v-slot="{ select }"
      :model-value="switcher.rankingSystem"
      variant="bordered"
      @update:model-value="(v: RankingSystem) => setSwitcher({ rankingSystem: v })"
    >
      <t-tab
        disabled
        class="p-0 m-0 f-tab grow"
      />
      <!-- <t-tab class="f-tab" value="Timeline">
        Timeline
      </t-tab> -->

      <t-tab
        v-for="(_stats, key) of tabs"
        :key="`user-tab-${key}`"
        class="f-tab"
        :value="key"
      >
        {{ rankingSystem[key].name }}
      </t-tab>

      <div
        v-if="Object.keys(dropdown).length"
        class="tab f-tab tab-bordered"
        :active="switcher.rankingSystem && Object.keys(dropdown).includes(switcher.rankingSystem)"
      >
        <div class="dropdown dropdown-end dropdown-hover">
          <div tabindex="0">
            Other Ranks
          </div>
          <ul
            tabindex="0"
            class="z-50 p-2 shadow dropdown-content menu bg-base-100 rounded-box rounded-3xl w-52"
          >
            <li
              v-for="(_stats, key) of dropdown"
              :key="`user-tab-${key}`"
            >
              <a
                class="z-50"
                @click="select(key)"
              >{{ rankingSystem[key].name }}</a>
            </li>

            <!-- <li><a>Acc Only(v2)</a></li> -->
          </ul>
        </div>
      </div>
      <t-tab
        disabled
        class="p-0 m-0 f-tab grow"
      />
    </t-tabs>
  </section>
</template>

<style lang="postcss" scoped>
.f-tab {
  @apply tab-sm sm:tab-sm md:tab-lg;
}
</style>
