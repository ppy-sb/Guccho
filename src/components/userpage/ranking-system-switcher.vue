<template>
  <section class="w-full pt-4 mx-auto ">
    <t-tabs v-slot="{ select }" v-model="tab" variant="bordered">
      <t-tab disabled class="p-0 m-0 f-tab grow" />
      <!-- <t-tab class="f-tab" value="Timeline">
        Timeline
      </t-tab> -->

      <t-tab v-for="(_stats, key) of tabs" :key="`user-tab-${key}`" class="f-tab" :value="key">
        {{ rankingSystem[key].name }}
      </t-tab>

      <div
        v-if="Object.keys(dropdown).length"
        class="tab f-tab tab-bordered"
        :active="tab && Object.keys(dropdown).includes(tab)"
      >
        <div class="dropdown dropdown-end dropdown-hover">
          <div tabindex="0">
            Other Ranks
          </div>
          <ul tabindex="0" class="z-50 p-2 shadow dropdown-content menu bg-base-100 rounded-box rounded-3xl w-52">
            <li v-for="(_stats, key) of dropdown" :key="`user-tab-${key}`">
              <a class="z-50" @click="select(key)">{{ rankingSystem[key].name }}</a>
            </li>

            <!-- <li><a>Acc Only(v2)</a></li> -->
          </ul>
        </div>
      </div>
      <t-tab disabled class="p-0 m-0 f-tab grow" />
    </t-tabs>
  </section>
</template>

<script setup lang="ts">
import { useAppConfig } from 'nuxt/app'
import { inject, Ref, computed } from 'vue'

import { useBackendConfig } from '#imports'

const { rankingSystem: serverRankingSystem } = await useBackendConfig()

const config = useAppConfig()
const rankingSystem = config.rankingSystem

const tab = inject<Ref<keyof typeof rankingSystem>>('rankingSystem')

type RankConf = {
  userpage:{
    show:string
  }
  name:string,
  icon:string
}
type Entry = [keyof typeof rankingSystem, RankConf]
const rankingSystemEntries = computed(() => Object.entries(rankingSystem) as Entry[])

const filter = (showType:'tab' | 'dropdown') =>
  rankingSystemEntries.value.reduce<
    Partial<
      Record<keyof typeof rankingSystem, RankConf>
    >
  >((acc, [key, value]) => {
    if (value.userpage.show !== showType) { return acc }
    if (key in serverRankingSystem === false) { return acc }
    acc[key] = value
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
