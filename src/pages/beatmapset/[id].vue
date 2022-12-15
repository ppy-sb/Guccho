<script setup lang="ts">
// @ts-expect-error no we do not have declaration
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const { $client } = useNuxtApp()
const route = useRoute()
const { data: beatmapset, error } = await useAsyncData(
  async () => await $client.map.beatmapset.query({ id: route.params.id.toString() }),
)
const selectedMapId = ref<unknown>(beatmapset.value?.beatmaps[0].id)
const selectedMap = computed(() =>
  beatmapset.value?.beatmaps.find(bm => bm.id === selectedMapId?.value),
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
          <h1 class="text-3xl font-bold text-center sm:text-left whitespace-nowrap">
            {{ beatmapset.meta.intl.title }}
          </h1>
          <h2
            class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left"
          >
            Song by {{ beatmapset.meta.intl.artist }}
          </h2>
        </div>
        <!-- eslint-disable-next-line vue/no-deprecated-v-on-native-modifier -->
        <div class="self-end overflow-x-auto overflow-y-show diff snap-x">
          <t-tabs
            v-model="selectedMapId"
            variant="lifted"
            size="md"
            class="justify-end w-max mx-4"
          >
            <t-tab
              v-for="bm in beatmapset.beatmaps"
              ref="tabs"
              :key="bm.id"
              :value="bm.id"
              class="whitespace-nowrap [--tab-border-color:transparent] snap-center"
            >
              {{ bm.version }}
            </t-tab>
          </t-tabs>
        </div>
      </div>
      <div
        v-if="selectedMap"
        ref="mapCard"
        class="card bg-base-100"
      >
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
          <JsonViewer :value="selectedMap" class="rounded-xl" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.header-with-maps {
  @apply sm:flex mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100;
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

.diff {
  &::-webkit-scrollbar {
    display: none;
  }

  .tab-lifted.tab-active {
    &:first-child {
      &:before {
        left: calc(0.5rem * -1);
        left: calc(var(--tab-radius, 0.5rem) * -1);
        --circle-pos: top left;
        background-image: var(--tab-corner-bg);
      }
    }
    &:last-child {
      &:after {
        right: calc(0.5rem * -1);
        right: calc(var(--tab-radius, 0.5rem) * -1);
        --circle-pos: top right;
        background-image: var(--tab-corner-bg);
      }
    }
  }
}
</style>
