<script setup async lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import userpageStore from '~/store/userpage'

definePageMeta({
  alias: [
    // compatible with osu stable client
    '/u/:handle',
  ],
})

const appConf = useAppConfig()
const { t } = useI18n()
const page = userpageStore()
const h = useRequestURL()
await page.init()

const switcherState = computed(() => `${page.switcher.mode} - ${page.switcher.ruleset} - ${page.switcher.rankingSystem}`)
const userWithAppName = computed(() => `${page.user?.name} - ${appConf.title}`)
const description = computed(() => switcherState.value)

useSeoMeta({
  description,
  ogTitle: userWithAppName,
  ogDescription: description,
  ogImage: () => page.user?.avatarSrc,
  ogUrl: () => h.href,
  twitterTitle: userWithAppName,
  twitterDescription: description,
  twitterImage: page.user?.avatarSrc,
  twitterCard: 'summary',
})

useHead({
  titleTemplate: `%s - ${appConf.title}`,
  title: () => page.user?.name || '',
})

const visible = reactive({
  heading: false,
  statistics: false,
  bestScores: false,
  topScores: false,
})
const icons: Record<keyof typeof visible, string> = {
  topScores: 'pajamas:first-contribution',
  bestScores: 'fa6-brands:pied-piper-pp',
  statistics: 'tabler:clipboard-data',
  heading: 'material-symbols:home-health-rounded',
}
const [handle, heading, statistics, bestScores, topScores] = [
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
]

onMounted(() => {
  const stop = Object.entries({
    heading,
    statistics,
    bestScores,
    topScores,
  }).map(([k, v]) => {
    if (!v.value) {
      return undefined
    }
    const { stop } = useIntersectionObserver(v, ([{ isIntersecting }]) => {
      visible[k as keyof typeof visible] = isIntersecting
    })
    return stop
  })
  onBeforeUnmount(() => {
    stop.forEach(item => item?.())
  })
})
</script>

<i18n lang="yaml">
en-GB:
  error-occured: Oops...
  unknown-error: something went wrong.
  back: bring me back
  retry: try again

zh-CN:
  error-occured: 抱歉
  unknown-error: 出现了一些小问题。
  back: 返回之前的页面
  retry: 重新加载

fr-FR:
  error-occured: Oups...
  unknown-error: Une erreur est survenue.
  back: Revenir en arrière
  retry: Réessayez
</i18n>

<template>
  <section v-if="page.error" class="flex grow">
    <div class="flex flex-col items-center justify-center gap-3 m-auto">
      <h1 class="text-3xl">
        {{ t('error-occured') }}
      </h1>
      <h2 v-if="page.error.message !== ''" class="text-2xl">
        {{ page.error.message }}
      </h2>
      <h2 v-else class="text-2xl">
        {{ t('unknown-error') }}
      </h2>
      <div class="grid grid-cols-2 gap-2">
        <t-button class="btn-shadow" variant="primary" @click="$router.back()">
          {{ t('back') }}
        </t-button>
        <t-button class="btn-shadow" variant="secondary" @click="page.refresh">
          {{ t('retry') }}
        </t-button>
      </div>
    </div>
  </section>

  <div v-else-if="page.user" ref="handle" class="flex flex-col justify-stretch">
    <userpage-heading id="heading" ref="heading" />
    <userpage-profile />
    <userpage-ranking-system-switcher class="z-10" />
    <div class="container mx-auto custom-container">
      <userpage-statistics id="statistics" ref="statistics" />
      <userpage-score-rank-composition />
    </div>
    <div id="bestScores" ref="bestScores" class="container py-2 mx-auto custom-container">
      <userpage-best-scores v-if="page.currentRankingSystem" />
    </div>
    <div id="topScores" ref="topScores" class="container py-4 mx-auto custom-container">
      <userpage-top-scores v-if="page.currentRankingSystem" />
    </div>
    <client-only>
      <teleport to="body">
        <div class="sticky btm-nav fuck">
          <template v-for="(isVisible, el) of visible" :key="el">
            <a
              v-if="icons[el]" :class="{
                active: isVisible,
              }" :href="`#${el}`"
            >
              <icon :name="icons[el]" size="2em" />
            </a>
            <a
              v-else :class="{
                active: isVisible,
              }" :href="`#${el}`"
            >
              {{ el }}
            </a>
          </template>
        </div>
      </teleport>
    </client-only>
  </div>
</template>

<style lang="postcss" scoped>
.fuck {
  justify-content: center;
}

.fuck>* {
  @apply md:basis-32
}
</style>
