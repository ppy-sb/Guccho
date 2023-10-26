<script setup lang="ts">
import { BeatmapSource } from '~/def/beatmap'
import { Mode } from '~/def'
import { AppScoresRankingSystemSwitcher } from '#components'
import type { Label } from '~/composables/useLinks'

definePageMeta({
  alias: ['/s/:id', '/beatmapsets/:id'],
})

const app = useNuxtApp()
const route = useRoute('beatmapset-id')
const config = useAppConfig()
const { supportedModes, supportedRulesets, hasRankingSystem, hasRuleset } = useAdapterConfig()
const [switcher, setSwitcher] = useSwitcher()
const lazyBgCover = shallowRef('')
const { t: _t } = useI18n()

const { data: beatmapset, error } = await useAsyncData(() =>
  app.$client.map.beatmapset.query({ id: route.params.id.toString() }),
)

const queryBeatmap = route.query.beatmap?.toString()

const hashed = beatmapset.value?.beatmaps.find(
  bm => bm.md5 === queryBeatmap || bm.id === queryBeatmap,
)
const selectedMapMd5 = shallowRef<string>(
  hashed?.md5 || beatmapset.value?.beatmaps[0].md5 || '',
)
const selectedMap = computed(() =>
  beatmapset.value?.beatmaps.find(bm => bm.md5 === selectedMapMd5.value),
)
const allowedModes = computed(() => {
  if (selectedMap.value?.mode === undefined) {
    return supportedModes
  }
  return selectedMap.value.mode !== Mode.Osu
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

watch(selectedMapMd5, updateSwitcher)

const { data: leaderboard, refresh } = await useAsyncData(async () => {
  if (!selectedMap.value) {
    return null
  }

  return await app.$client.rank.beatmap.query({
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
      `${beatmapset.value?.meta.intl.artist} - ${beatmapset.value?.meta.intl.title} > ${selectedMap.value?.version}`,
  ),
})

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
  if (selectedMap.value.mode !== Mode.Osu) {
    switcher.mode = selectedMap.value.mode
  }
}

async function update() {
  await refresh()
  updateSwitcher()
  rewriteAnchor()
}
</script>

<i18n lang="yaml">
en-GB:
  beatmapset:
    placement: '{title} by {artist}'
    external-links: External Links
    direct-downloads: Direct downloads
    creator: Creator
    status: Status
    beatmap-id: Beatmap ID
    source-id: Source | ID
    last-update: Last Update
    star-rating: Star Rating
    circle-size: Circle Size
    approach-rate: Approach Rate
    od: OD
    hp-drain: HP Drain
    duration: Duration
    hit-Objects: Hit Objects
    hit-object:
      circles: circles
      sliders: sliders
      spinners: spinners
zh-CN:
  beatmapset:
    placement: "曲名:{title} \n 艺术家:{artist}"
    external-links: 其它链接
    direct-downloads: 直接下载
    creator: 铺师
    status: 状态
    beatmap-id: 铺面 ID
    source-id: 来源 | ID
    last-update: 上次更新时间
    star-rating: 难度星级
    circle-size: 圆圈大小
    approach-rate: 缩圈速度
    od: 准度要求
    hp-drain: 掉血速度
    duration: 长度
    hit-objects: 物件统计
    hit-object:
      circles: 圆圈
      sliders: 滑条
      spinners: 转盘
fr-FR:
  beatmapset:
    placement: '{title} par {artist}'
    external-links: External Links
    direct-downloads: Direct downloads
    creator: Creator
    status: Status
    beatmap-id: Beatmap ID
    source-id: Source | ID
    last-update: Last Update
    star-rating: Star Rating
    circle-size: Circle Size
    approach-rate: Approach Rate
    od: OD
    hp-drain: HP Drain
    duration: Duration
    hit-Objects: Hit Objects
    hit-object:
      circles: circles
      sliders: sliders
      spinners: spinners
</i18n>

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
    <div class="container custom-container mx-auto">
      <div class="header-with-maps flex-wrap">
        <i18n-t keypath="beatmapset.placement" tag="p" class="font-light text-lg">
          <template #title>
            <span class="text-2xl font-bold text-center sm:text-left lg:whitespace-nowrap z-10">
              {{ beatmapset.meta.intl.title }}
            </span>
          </template>
          <template #artist>
            <span class="font-semibold text-xl">
              {{ beatmapset.meta.intl.artist }}
            </span>
          </template>
        </i18n-t>
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
        </div>
        <div class="flex flex-col md:flex-row">
          <div class="w-full md:w-1/3 grow">
            <div class="flex flex-col p-4 md:p-3 h-full">
              <img class="rounded-xl shadow-md max-w-content" :src="beatmapset.assets['list@2x']" :alt="selectedMap.version" :onerror="placeholder">
              <div v-if="links" class="pt-2">
                <div class="w-min">
                  <t-menu>
                    <button class="btn btn-shadow btn-primary btn-circle rounded-full">
                      <icon name="material-symbols:file-present-rounded" size="2em" />
                    </button>
                    <template #popper>
                      <ul class="menu menu-compact border-[1px] border-base-300/20 bg-base-200/80 w-max rounded-box">
                        <template v-if="links.external.length">
                          <li class="menu-title">
                            <span>{{ _t('beatmapset.external-links') }}</span>
                          </li>
                          <li v-for="{ link, label } in links.external" :key="`external-${label}`">
                            <a :href="link">{{ label }}</a>
                          </li>
                        </template>
                        <template v-if="links.directDownload.length">
                          <div class="divider" />
                          <li class="menu-title">
                            <span>{{ _t('beatmapset.direct-downloads') }}</span>
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
          </div>
          <div class="w-full md:w-2/3">
            <dl>
              <div class="stripe-odd rounded-tl-xl">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.creator') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.creator }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.status') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.status }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.beatmap-id') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ selectedMap.id }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.source-id') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  {{ BeatmapSource[beatmapset.source] }} | {{ selectedMap.foreignId }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.last-update') }}
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
                  {{ _t('beatmapset.star-rating') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/overall-difficulty.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.starRate }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.circle-size') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/size.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.circleSize }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.approach-rate') }}
                </dt>
                <dd class="stripe-even flex gap-1 items-center">
                  <img src="~/assets/icons/approach-rate.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.approachRate }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.od') }}
                </dt>
                <dd class="stripe-even flex gap-1 items-center">
                  <img src="~/assets/icons/accuracy.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.accuracy }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.hp-drain') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/hp-drain.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.hpDrain }}
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.duration') }}
                </dt>
                <dd class="stripe-even  flex gap-1 items-center">
                  <img src="~/assets/icons/length.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.totalLength }} seconds
                </dd>
              </div>
              <div class="stripe-odd">
                <dt class="text-sm font-medium text-gbase-500">
                  {{ _t('beatmapset.hit-objects') }}
                </dt>
                <dd class="stripe-even">
                  <div class="flex gap-1 items-center">
                    <img src="~/assets/icons/circles.png" alt="" class="w-5 color-theme-light-invert"> {{ selectedMap.properties.count.circles }} {{ _t('beatmapset.hit-object.circles') }},
                  </div>
                  <div class="flex gap-1 items-center">
                    <img src="~/assets/icons/sliders.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.count.sliders }} {{ _t('beatmapset.hit-object.sliders') }},
                  </div>
                  <div class="flex gap-1 items-center">
                    <img src="~/assets/icons/spinners.png" alt="" class="w-5 color-theme-light-invert">{{ selectedMap.properties.count.spinners }} {{ _t('beatmapset.hit-object.spinners') }},<br>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <AppScoresRankingSystemSwitcher
        ref="scoreRS"
        v-model="switcher.rankingSystem" class="mt-2" :mode="switcher.mode"
        :ruleset="switcher.ruleset" @update:model-value="update"
      />
      <app-scores-table
        v-if="leaderboard" :scores="leaderboard" :ranking-system="switcher.rankingSystem"
        :class="{
          'clear-rounded-tl': scoreRS?.rankingSystems[0] === switcher.rankingSystem,
        }"
      />
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
