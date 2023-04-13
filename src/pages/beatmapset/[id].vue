<script setup lang="ts">
// @ts-expect-error no d.ts
import VLazyImage from 'v-lazy-image'
import AppScoresRankingSystemSwitcher from '~/components/app/scores/ranking-system-switcher.vue'
import {
  includes,
  isBanchoBeatmapset,
  loadImage,
  noop,
  placeholder,
} from '~/utils'
import type { Label } from '~/composables/useLinks'

const app$ = useNuxtApp()
const route = useRoute()
const config = useAppConfig()
const {
  supportedModes,
  supportedRulesets,
  hasRankingSystem,
  hasRuleset,
} = useAdapterConfig()
const [switcher, setSwitcher] = useSwitcher()
const lazyBgCover = ref('')

const { data: beatmapset, error } = await useAsyncData(
  async () =>
    await app$.$client.map.beatmapset.query({ id: route.params.id.toString() }),
)
const hashed = beatmapset.value?.beatmaps.find(
  bm => bm.id === route.query.beatmap?.toString(),
)
const selectedMapId = ref<string>(
  hashed?.id || beatmapset.value?.beatmaps[0].id || '',
)
const selectedMap = computed(() =>
  beatmapset.value?.beatmaps.find(bm => bm.id === selectedMapId.value),
)
const allowedModes = computed(() => {
  if (!selectedMap.value?.mode) {
    return supportedModes
  }
  return (selectedMap.value.mode !== 'osu') ? [selectedMap.value.mode] : supportedModes
})

const bgCover = beatmapset.value
  && isBanchoBeatmapset(beatmapset.value) && {
  cover: `https://assets.ppy.sh/beatmaps/${
      beatmapset.value.foreignId
    }/covers/cover.jpg?${Math.floor(new Date().getTime() / 1000)}`,
  listUrl: `https://assets.ppy.sh/beatmaps/${
      beatmapset.value.foreignId
    }/covers/list@2x.jpg?${Math.floor(new Date().getTime() / 1000)}`,
}
const queryRankingSystem = route.query.rank?.toString()
const queryMode = route.query.mode?.toString()
const queryRuleset = route.query.ruleset?.toString()

setSwitcher({
  mode: includes(queryMode, supportedModes) ? queryMode : undefined,
  ruleset: includes(queryRuleset, supportedRulesets)
    ? queryRuleset
    : undefined,
})

if (queryRankingSystem) {
  setSwitcher({
    rankingSystem: (hasRuleset(switcher.mode, switcher.ruleset)
      && hasRankingSystem(switcher.mode, switcher.ruleset, queryRankingSystem))
      ? queryRankingSystem
      : undefined,
  })
}

function rewriteAnchor() {
  const url = new URL(window.location.toString())
  if (selectedMap.value) {
    url.searchParams.set('beatmap', selectedMap.value.id)
  }

  url.searchParams.set('rank', switcher.rankingSystem)
  url.searchParams.set('mode', switcher.mode)
  url.searchParams.set('ruleset', switcher.ruleset)
  history.replaceState({}, '', url)
}

function updateSwitcher() {
  if (!selectedMap.value) {
    return
  }
  if (selectedMap.value.mode !== 'osu') {
    switcher.mode = selectedMap.value.mode
  }
}

watch(selectedMapId, updateSwitcher)

const { data: leaderboard, refresh } = await useAsyncData(async () => {
  if (!selectedMap.value) {
    return null
  }

  return await app$.$client.leaderboard.beatmap.query({
    ...switcher,
    page: 0,
    pageSize: 20,
    beatmapId: selectedMap.value.id.toString(),
  })
})

updateSwitcher()

useHead({
  titleTemplate: `%s - ${config.title}`,
  title: computed(() => `${beatmapset.value?.meta.intl.artist} - ${beatmapset.value?.meta.intl.title} > ${selectedMap.value?.version}`),
})

async function update() {
  await refresh()
  updateSwitcher()
  rewriteAnchor()
}

const scoreRS = ref<InstanceType<typeof AppScoresRankingSystemSwitcher> | null>(null)

const links = ref<{
  external: Label[]
  directDownload: Label[]
}>()

onBeforeMount(() => {
  bgCover
    && loadImage(bgCover.cover)
      .then(() => {
        lazyBgCover.value = `url(${bgCover.cover})`
      })
      .catch(noop)

  links.value = beatmapset.value ? useExternalBeatmapsetLinks(beatmapset.value) : undefined
})
</script>

<template>
  <section v-if="error" class="section custom-container mx-auto">
    <div>
      {{ error?.message }}
    </div>
  </section>
  <div
    v-else-if="beatmapset"
    :class="[
      isBanchoBeatmapset(beatmapset) && `pre-bg-cover`,
      lazyBgCover !== '' && 'ready',
    ]"
  >
    <div class="container custom-container mx-auto">
      <div class="header-with-maps flex-wrap">
        <div class="text-center flex gap-2 items-baseline pb-2 pl-4">
          <h1
            class="text-3xl font-bold text-center sm:text-left lg:whitespace-nowrap"
          >
            {{ beatmapset.meta.intl.title }}
          </h1>
          <h2
            class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left"
          >
            by {{ beatmapset.meta.intl.artist }}
          </h2>
        </div>
        <t-tabs
          v-model="selectedMapId"
          variant="bordered"
          size="md"
          class="mx-4 self-end bg-transparent"
          @update:model-value="update"
        >
          <t-tab
            v-for="bm in beatmapset.beatmaps"
            :key="bm.id"
            :value="bm.id"
            class="whitespace-nowrap grow"
          >
            {{ bm.version }}
          </t-tab>
        </t-tabs>
      </div>
      <div
        v-if="selectedMap"
        class="flex flex-col md:flex-row card bg-gbase-100 dark:bg-gbase-900"
      >
        <div class="w-full md:w-1/3 grow">
          <div class="p-8 h-full flex flex-col justify-around">
            <VLazyImage
              v-if="bgCover"
              class="rounded-xl w-full shadow-md"
              src-placeholder="/images/image-placeholder.svg"
              :src="bgCover.listUrl"
              alt="list"
              :onerror="placeholder"
            />
            <!-- // TODO in house beatmap links -->
            <div v-if="links" class="pt-4">
              <div class="w-min">
                <t-menu>
                  <button class="btn btn-sm btn-accent">
                    download
                  </button>
                  <template #popper>
                    <ul
                      class="menu menu-compact border-[1px] border-base-300/20 bg-base-200/80 w-max rounded-box"
                    >
                      <template v-if="links.external.length">
                        <li class="menu-title">
                          <span>External Links</span>
                        </li>
                        <li v-for="{ link, label } in links.external" :key="`external-${label}`">
                          <a
                            :href="link"
                          >{{ label }}</a>
                        </li>
                      </template>
                      <template v-if="links.directDownload.length">
                        <div class="divider" />
                        <li class="menu-title">
                          <span>Direct downloads</span>
                        </li>
                        <li v-for="{ link, label } in links.directDownload" :key="`direct-${label}`">
                          <a
                            :href="link"
                          >{{ label }}</a>
                        </li>
                      </template>
                    </ul>
                  </template>
                </t-menu>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full md:w-2/3">
          <div class="p-2 flex justify-between">
            <t-tabs
              v-model="switcher.mode"
              @update:model-value="update"
            >
              <template v-for="m in allowedModes">
                <t-tab
                  v-if="hasRuleset(m, switcher.ruleset)"
                  :key="`sw-${m}`"
                  :value="m"
                >
                  {{ m }}
                </t-tab>
              </template>
            </t-tabs>
            <t-tabs
              v-model="switcher.ruleset"
              variant=""
              @update:model-value="update"
            >
              <template v-for="r in supportedRulesets">
                <t-tab
                  v-if="hasRuleset(switcher.mode, r)"
                  :key="`sw-${r}`"
                  :value="r"
                >
                  {{ r }}
                </t-tab>
              </template>
            </t-tabs>
          </div>
          <dl>
            <div class="stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Creator
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.creator }}
              </dd>
            </div>
            <div class="bg-gbase-50 dark:bg-gbase-800 stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Status
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.status }}
              </dd>
            </div>
            <div class="stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Beatmap ID
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.id }}
              </dd>
            </div>
            <div class="bg-gbase-50 dark:bg-gbase-800 stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Source | ID
              </dt>
              <dd class="stripe-even">
                {{ beatmapset.source }} | {{ selectedMap.foreignId }}
              </dd>
            </div>
            <div class="stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Last Update
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.lastUpdate }}
              </dd>
            </div>
            <div class="bg-gbase-50 dark:bg-gbase-800 stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                BPM
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.properties.bpm }}
              </dd>
            </div>
            <div class="stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Star Rate
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.properties.starRate }}
              </dd>
            </div>
            <div class="bg-gbase-50 dark:bg-gbase-800 stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Circle Size
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.properties.circleSize }}
              </dd>
            </div>
            <div class="stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                HP Drain
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.properties.hpDrain }}
              </dd>
            </div>
            <div class="bg-gbase-50 dark:bg-gbase-800 stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Duration
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.properties.totalLength }} seconds
              </dd>
            </div>
            <div class="stripe-odd">
              <dt class="text-sm font-medium text-gbase-500">
                Hit Object
              </dt>
              <dd class="stripe-even">
                {{ selectedMap.properties.count.circles }} circles,<br>
                {{ selectedMap.properties.count.sliders }} sliders,<br>
                {{ selectedMap.properties.count.spinners }} spinners,<br>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    <div class="container custom-container mx-auto mt-4">
      <AppScoresRankingSystemSwitcher
        ref="scoreRS"
        v-model="switcher.rankingSystem"
        :mode="switcher.mode"
        :ruleset="switcher.ruleset"
        class="mx-auto"
        @update:model-value="update"
      />
      <div class="overflow-auto">
        <app-scores-table
          v-if="leaderboard"
          :scores="leaderboard"
          :ranking-system="switcher.rankingSystem"
          class="w-full"
          :class="{
            'clear-rounded-tl':
              scoreRS?.rankingSystems[0] === switcher.rankingSystem,
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.header-with-maps {
  @apply sm:flex pt-20 lg:pt-0 mt-2 items-center justify-between text-gbase-900 dark:text-gbase-100;
  transition: 0.3s ease;
  @apply pb-0;

  @apply md:pt-20;
}

.stripe-odd {
  @apply px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6;
}

.stripe-even {
  @apply mt-1 text-sm text-gbase-900 dark:text-gbase-100 sm:col-span-2 sm:mt-0;
}

:deep(table.table.clear-rounded-tl) {
  > thead {
    > tr:first-child {
      > th:first-child {
        @apply rounded-tl-none;
      }
    }
  }
}
.safari .pre-bg-cover {
  -webkit-transform: translate3d(0, 0, 0);
}
.pre-bg-cover {
  &:before {
    content: "";
    position: absolute;
    @apply top-20 left-0 right-0 bg-cover;
    height: 30vmin;
  }
  &.ready::before {
    background-image: v-bind("lazyBgCover");
    animation: fadeIn 0.5s ease-out forwards;
  }
}
@keyframes fadeIn {
  0% {
    filter: opacity(0) contrast(0.5) brightness(1) blur(5em);
  }
  100% {
    filter: opacity(0.4) contrast(0.2) brightness(1.5) blur(3em);
  }
}

@media (prefers-color-scheme: dark) {
  @keyframes fadeIn {
    0% {
      filter: opacity(0) contrast(0.5) brightness(1) blur(5em);
    }
    100% {
      filter: opacity(1) contrast(0.5) brightness(0.5) blur(3em);
    }
  }
}
</style>
