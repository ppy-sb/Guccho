<script setup lang="ts">
// @ts-expect-error no we do not have declaration
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const { $client } = useNuxtApp()
const route = useRoute()
const { data: beatmapset, error } = await useAsyncData(
  async () =>
    await $client.map.beatmapset.query({ id: route.params.id.toString() }),
)
const selectedMapId = ref<unknown>(
  route.hash?.slice(1) || beatmapset.value?.beatmaps[0].id.toString(),
)
const selectedMap = computed(() =>
  beatmapset.value?.beatmaps.find(
    bm => bm.id.toString() === selectedMapId?.value,
  ),
)
</script>

<template>
  <section v-if="error" class="section custom-container mx-auto">
    <div>
      {{ error?.message }}
    </div>
  </section>
  <div v-else-if="beatmapset">
    <div class="container custom-container mx-auto">
      <div class="header-with-maps flex-wrap">
        <div class="text-center">
          <h1
            class="text-3xl font-bold text-center sm:text-left whitespace-nowrap"
          >
            {{ beatmapset.meta.intl.title }}
          </h1>
          <h2
            class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left pb-2"
          >
            Song by {{ beatmapset.meta.intl.artist }}
          </h2>
        </div>
        <!-- eslint-disable-next-line vue/no-deprecated-v-on-native-modifier -->
        <!-- <div class="self-end mx-4 overflow-x-auto diff snap-x">
        </div> -->
        <t-tabs
          v-model="selectedMapId"
          variant="bordered"
          size="md"
          class="mx-4 self-end bg-transparent"
        >
          <t-tab
            v-for="bm in beatmapset.beatmaps"
            ref="tabs"
            :key="bm.id"
            :value="bm.id.toString()"
            class="whitespace-nowrap grow"
          >
            {{ bm.version }}
          </t-tab>
        </t-tabs>
      </div>
      <div v-if="selectedMap" ref="mapCard" class="card bg-kimberly-100 dark:bg-kimberly-900">
        <dl>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Creator
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.creator }}
            </dd>
          </div>
          <div class="bg-kimberly-50 dark:bg-kimberly-800 stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Status
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.status }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Beatmap ID
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.id }}
            </dd>
          </div>
          <div class="bg-kimberly-50 dark:bg-kimberly-800 stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Source | ID
            </dt>
            <dd class="stripe-even">
              {{ beatmapset.source }} | {{ selectedMap.foreignId }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Last Update
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.lastUpdate }}
            </dd>
          </div>
          <div class="bg-kimberly-50 dark:bg-kimberly-800 stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              BPM
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.bpm }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Star Rate
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.starRate }}
            </dd>
          </div>
          <div class="bg-kimberly-50 dark:bg-kimberly-800 stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Circle Size
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.circleSize }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              HP Drain
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.hpDrain }}
            </dd>
          </div>
          <div class="bg-kimberly-50 dark:bg-kimberly-800 stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Duration
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.totalLength }} seconds
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-kimberly-500">
              Hit Object
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.count.circles }} circles,<br>
              {{ selectedMap.properties.count.sliders }} sliders,<br>
              {{ selectedMap.properties.count.spinners }} spinners,<br>
            </dd>
          </div>
        </dl>
        <div class="card-body">
          <JsonViewer
            :value="{
              beatmap: selectedMap,
              beatmapset: {
                ...beatmapset,
                beatmaps: 'hidden from json viewer',
              },
            }"
            class="rounded-xl"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.header-with-maps {
  @apply sm:flex pt-20 lg:pt-0 mt-2 items-center justify-between text-kimberly-900 dark:text-kimberly-100;
  transition: 0.3s ease;
  @apply pb-0;

  @apply md:pt-20;
}

.stripe-odd {
  @apply px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6;
}

.stripe-even {
  @apply mt-1 text-sm text-kimberly-900 dark:text-kimberly-100 sm:col-span-2 sm:mt-0;
}
/* .tab.tab-lifted {
  @apply bg-gradient-to-b -order-1;
  @apply from-gray-50 to-gray-100 border-kimberly-200;
  @apply dark:from-gray-800 dark:to-gray-900 border-kimberly-700;
  @apply border-[1px] border-b-0;
  &.tab-active {
    @apply bg-gradient-to-b border-b-0;
    @apply from-kimberly-50 via-kimberly-100 to-kimberly-100;
    @apply dark:from-kimberly-700 via-kimberly-800 to-kimberly-800;
    &:before, &:after {
      background-image: none;
    }
  }
} */
.diff {
  &::-webkit-scrollbar {
    height: 0.5em;
    @apply bg-transparent;
  }
  &::-webkit-scrollbar-thumb {
    @apply bg-kimberly-500/50
  }
}
</style>
