<script setup lang="ts">
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const { $client } = useNuxtApp()
const route = useRoute()
const { data: beatmapset, error } = await useAsyncData(async () => await $client.map.beatmapset.query({ id: route.params.id.toString() }))
const selectedMapId = ref<unknown>(beatmapset.value?.beatmaps[0].id)
const selectedMap = computed(() => beatmapset.value?.beatmaps.find(bm => bm.id === selectedMapId?.value))
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
            class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left"
          >
            Song by {{ beatmapset.meta.intl.artist }}
          </h2>
        </div>
        <t-tabs v-model="selectedMapId" variant="lifted" size="sm" class="self-end justify-end">
          <t-tab v-for="bm in beatmapset.beatmaps" :key="bm.id" :value="bm.id" class="[--tab-border-color:transparent]">
            {{ bm.version }}
          </t-tab>
        </t-tabs>
      </div>
      <!-- <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            Applicant Information
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and application.
          </p>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 stripe-odd">
              <dt class="text-sm font-medium text-gray-500">
                Full name
              </dt>
              <dd class="stripe-even">
                Margot Foster
              </dd>
            </div>
            <div class="bg-white stripe-odd">
              <dt class="text-sm font-medium text-gray-500">
                Application for
              </dt>
              <dd class="stripe-even">
                Backend Developer
              </dd>
            </div>
            <div class="bg-gray-50 stripe-odd">
              <dt class="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd class="stripe-even">
                margotfoster@example.com
              </dd>
            </div>
            <div class="bg-white stripe-odd">
              <dt class="text-sm font-medium text-gray-500">
                Salary expectation
              </dt>
              <dd class="stripe-even">
                $120,000
              </dd>
            </div>
            <div class="bg-gray-50 stripe-odd">
              <dt class="text-sm font-medium text-gray-500">
                About
              </dt>
              <dd class="stripe-even">
                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
              </dd>
            </div>
            <div class="bg-white stripe-odd">
              <dt class="text-sm font-medium text-gray-500">
                Attachments
              </dt>
              <dd class="stripe-even">
                <ul role="list" class="divide-y divide-gray-200 rounded-md border border-gray-200">
                  <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                    <div class="flex w-0 flex-1 items-center">
                      <PaperClipIcon class="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      <span class="ml-2 w-0 flex-1 truncate">resume_back_end_developer.pdf</span>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                      <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                    </div>
                  </li>
                  <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                    <div class="flex w-0 flex-1 items-center">
                      <PaperClipIcon class="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      <span class="ml-2 w-0 flex-1 truncate">coverletter_back_end_developer.pdf</span>
                    </div>
                    <div class="ml-4 flex-shrink-0">
                      <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a>
                    </div>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div> -->
      <div
        v-if="selectedMap"
        class="card bg-base-100" :class="{
          'rounded-tr-none': selectedMapId === beatmapset.beatmaps.at(-1)?.id,
        }"
      >
        <dl>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Creator
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.creator }}
            </dd>
          </div>
          <div class="bg-kimberly-50 stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Status
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.status }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Beatmap ID
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.id }}
            </dd>
          </div>
          <div class="bg-kimberly-50 stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Source | ID
            </dt>
            <dd class="stripe-even">
              {{ beatmapset.source }} | {{ selectedMap.foreignId }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Last Update
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.lastUpdate }}
            </dd>
          </div>
          <div class="bg-kimberly-50 stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              BPM
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.bpm }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Star Rate
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.starRate }}
            </dd>
          </div>
          <div class="bg-kimberly-50 stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Circle Size
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.circleSize }}
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              HP Drain
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.hpDrain }}
            </dd>
          </div>
          <div class="bg-kimberly-50 stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
              Duration
            </dt>
            <dd class="stripe-even">
              {{ selectedMap.properties.totalLength }} seconds
            </dd>
          </div>
          <div class="stripe-odd">
            <dt class="text-sm font-medium text-gray-500">
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
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100 ; */
  transition: 0.3s ease;
  @apply pb-0;

  @apply md:pt-20;
}
.stripe-odd {
  @apply px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6
}
.stripe-even {
  @apply mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0
}
</style>

