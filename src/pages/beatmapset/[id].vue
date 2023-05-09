<script setup lang="ts">
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import type { AppScoresRankingSystemSwitcher } from '#components'
import type { Label } from '~/composables/useLinks'

const { addToLibrary } = useFAIcon()

addToLibrary(faEllipsisH)

const app$ = useNuxtApp()
const route = useRoute()
const config = useAppConfig()
const { supportedModes, supportedRulesets, hasRankingSystem, hasRuleset }
  = useAdapterConfig()
const [switcher, setSwitcher] = useSwitcher()
const lazyBgCover = shallowRef('')

const { data: beatmapset, error } = await useAsyncData(() =>
  app$.$client.map.beatmapset.query({ id: route.params.id.toString() })
)

const queryBeatmap = route.query.beatmap?.toString()

const hashed = beatmapset.value?.beatmaps.find(
  bm => bm.md5 === queryBeatmap || bm.id === queryBeatmap
)
const selectedMapMd5 = shallowRef<string>(
  hashed?.md5 || beatmapset.value?.beatmaps[0].md5 || ''
)
const selectedMap = computed(() =>
  beatmapset.value?.beatmaps.find(bm => bm.md5 === selectedMapMd5.value)
)
const allowedModes = computed(() => {
  if (!selectedMap.value?.mode) {
    return supportedModes
  }
  return selectedMap.value.mode !== 'osu'
    ? [selectedMap.value.mode]
    : supportedModes
})

const queryRankingSystem = route.query.rank?.toString()
const queryMode = route.query.mode?.toString()
const queryRuleset = route.query.ruleset?.toString()

setSwitcher({
  mode: includes(queryMode, supportedModes) ? queryMode : undefined,
  ruleset: includes(queryRuleset, supportedRulesets) ? queryRuleset : undefined,
})

if (
  queryRankingSystem
  && hasRuleset(switcher.mode, switcher.ruleset)
  && hasRankingSystem(switcher.mode, switcher.ruleset, queryRankingSystem)
) {
  setSwitcher({
    rankingSystem: queryRankingSystem,
  })
}

function rewriteAnchor() {
  const url = new URL(window.location.toString())
  if (selectedMap.value) {
    url.searchParams.set('beatmap', selectedMap.value.md5)
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

watch(selectedMapMd5, updateSwitcher)

const { data: leaderboard, refresh } = await useAsyncData(async () => {
  if (!selectedMap.value) {
    return null
  }

  return await app$.$client.leaderboard.beatmap.query({
    ...switcher,
    page: 0,
    pageSize: 20,
    md5: selectedMap.value.md5,
  })
})

updateSwitcher()

useHead({
  titleTemplate: `%s - ${config.title}`,
  title: computed(
    () =>
      `${beatmapset.value?.meta.intl.artist} - ${beatmapset.value?.meta.intl.title} > ${selectedMap.value?.version}`
  ),
})

async function update() {
  await refresh()
  updateSwitcher()
  rewriteAnchor()
}

const scoreRS = shallowRef<InstanceType<
  typeof AppScoresRankingSystemSwitcher
> | null>(null)

const links = shallowRef<{
  external: Label[]
  directDownload: Label[]
}>()

onBeforeMount(() => {
  beatmapset.value
    && isBanchoBeatmapset(beatmapset.value)
    && beatmapset.value.assets.cover
    && loadImage(beatmapset.value.assets.cover)
      .then(() => {
        lazyBgCover.value = `url(${beatmapset.value?.assets.cover})`
      })
      .catch(noop)

  links.value = beatmapset.value
    ? useExternalBeatmapsetLinks(beatmapset.value)
    : undefined
})
</script>

<template>
  <section v-if="error" class="section custom-container mx-auto">
    <div>
      {{ error?.message }}
    </div>
  </section>
  <div
    v-else-if="beatmapset" :class="[
      isBanchoBeatmapset(beatmapset) && `pre-bg-cover`,
      lazyBgCover !== '' && 'ready',
    ]"
  >
    <div class="container custom-container mx-auto pt-20">
      <div class="header-with-maps flex-wrap">
        <div class="text-center flex gap-2 items-baseline pb-2 pl-4">
          <h1 class="text-3xl font-bold text-center sm:text-left lg:whitespace-nowrap z-10">
            {{ beatmapset.meta.intl.title }}
          </h1>
          <h2 class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left z-10">
            by {{ beatmapset.meta.intl.artist }}
          </h2>
        </div>
        <t-tabs
          v-model="selectedMapMd5" variant="bordered" size="md" class="mx-4 self-end bg-transparent"
          @update:model-value="update"
        >
          <t-tab v-for="bm in beatmapset.beatmaps" :key="bm.md5" :value="bm.md5" class="whitespace-nowrap grow">
            {{ bm.version }}
          </t-tab>
        </t-tabs>
      </div>
      <div v-if="selectedMap" class="card bg-gbase-100 dark:bg-gbase-900 overflow-hidden">
        <div class="m-2 relative flex flex-col md:flex-row items-center">
          <t-tabs v-model="switcher.mode" class="md:mr-auto" @update:model-value="update">
            <template v-for="m in allowedModes">
              <t-tab v-if="hasRuleset(m, switcher.ruleset)" :key="`sw-${m}`" :value="m">
                <img
                  :src="`/icons/mode/${m}.svg`"
                  class="color-theme-light-invert h-mode"
                >
              </t-tab>
            </template>
          </t-tabs>
          <t-tabs v-model="switcher.ruleset" variant="" @update:model-value="update">
            <template v-for="r in supportedRulesets">
              <t-tab v-if="hasRuleset(switcher.mode, r)" :key="`sw-${r}`" :value="r">
                {{ r }}
              </t-tab>
            </template>
          </t-tabs>
          <!-- // TODO in house beatmap links -->
          <div v-if="links" class="absolute md:relative right-0">
            <div class="w-min">
              <t-menu>
                <button class="btn btn-sm btn-ghost">
                  <font-awesome-icon icon="fa-solid fa-ellipsis-h" size="xl" />
                </button>
                <template #popper>
                  <ul class="menu menu-compact border-[1px] border-base-300/20 bg-base-200/80 w-max rounded-box">
                    <template v-if="links.external.length">
                      <li class="menu-title">
                        <span>External Links</span>
                      </li>
                      <li v-for="{ link, label } in links.external" :key="`external-${label}`">
                        <a :href="link">{{ label }}</a>
                      </li>
                    </template>
                    <template v-if="links.directDownload.length">
                      <div class="divider" />
                      <li class="menu-title">
                        <span>Direct downloads</span>
                      </li>
                      <li v-for="{ link, label } in links.directDownload" :key="`direct-${label}`">
                        <a :href="link">{{ label }}</a>
                      </li>
                    </template>
                  </ul>
                </template>
              </t-menu>
            </div>
          </div>
        </div>
        <div class="flex flex-col md:flex-row">
          <div class="w-full md:w-1/3 grow">
            <div class="flex flex-col p-4 md:p-2 h-full">
              <img class="rounded-xl shadow-md max-w-content" :src="beatmapset.assets['list@2x']" :alt="selectedMap.version" :onerror="placeholder">
            </div>
          </div>
          <div class="w-full md:w-2/3">
            <dl>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Creator
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.creator }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Status
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.status }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Beatmap ID
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.id }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Source | ID
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ beatmapset.source }} | {{ selectedMap.foreignId }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Last Update
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.lastUpdate }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  BPM
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/bpm.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.bpm }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Star Rate
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/overall-difficulty.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.starRate }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Circle Size
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/size.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.circleSize }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Approach Rate
                </dt>
                <dd class="stripe-even flex gap-1 items-center">
                  <img src="~/assets/icons/approach-rate.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.approachRate }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Accuracy
                </dt>
                <dd class="stripe-even flex gap-1 items-center">
                  <img src="~/assets/icons/accuracy.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.accuracy }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  HP Drain
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/hp-drain.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.hpDrain }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Duration
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/length.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.totalLength }} seconds
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  Hit Object
                </dt>
                <dd class="stripe-even">
                  <div class="flex gap-1 items-center">
                    <img src="~/assets/icons/circles.png" alt="" class="w-5 color-theme-light-invert"> {{ selectedMap.properties.count.circles }} circles,
                  </div>
                  <div class="flex gap-1 items-center">
                    <img src="~/assets/icons/sliders.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.count.sliders }} sliders,
                  </div>
                  <div class="flex gap-1 items-center">
                    <img src="~/assets/icons/spinners.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.count.spinners }} spinners,<br>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
    <div class="container custom-container mx-auto mt-4">
      <app-scores-ranking-system-switcher
        ref="scoreRS" v-model="switcher.rankingSystem" :mode="switcher.mode"
        :ruleset="switcher.ruleset" class="mx-auto" @update:model-value="update"
      />
      <div class="overflow-auto">
        <app-scores-table
          v-if="leaderboard" :scores="leaderboard" :ranking-system="switcher.rankingSystem" class="w-full"
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
  @apply sm:flex pb-0 mt-2 items-center justify-between text-gbase-900 dark:text-gbase-100;
  transition: 0.3s ease;
}

.stripe-odd {
  @apply px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6;
  &:nth-child(odd){
    @apply bg-gbase-50 dark:bg-gbase-800
  }
}

.stripe-even  flex gap-1 items-center {
  @apply mt-1 text-sm text-gbase-900 dark:text-gbase-100 sm:col-span-2 sm:mt-0;
}

:deep(table.table.clear-rounded-tl) {
  >thead {
    >tr:first-child {
      >th:first-child {
        @apply rounded-tl-none;
      }
    }
  }
}

.safari .pre-bg-cover {
  transform: translate3d(0, 0, 0);
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

.color-theme-light-invert {
  filter: invert(100%);
  @apply dark:[filter:invert(0)];
}
.h-mode {
  @apply transition duration-200 ease-in-out font-semibold cursor-pointer opacity-50;
  @apply sm:py-1 sm:my-0;
  @apply w-7 h-7;
}
.tab-active .h-mode {
  @apply opacity-100;
}
</style>
