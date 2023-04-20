<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import {
  faBarsStaggered,
  faHouseUser,
  faRankingStar,
} from '@fortawesome/free-solid-svg-icons'
import { faPiedPiperPp } from '@fortawesome/free-brands-svg-icons'
import userpageStore from '~/store/userpage'

const { addToLibrary } = useFAIconLib()

addToLibrary(faRankingStar, faPiedPiperPp, faBarsStaggered, faHouseUser)

definePageMeta({
  layout: 'screen',
})
const appConf = useAppConfig()

const [_, setScroll] = useScrollYObserver()

const page = userpageStore()

await page.refresh()

const {
  switcherCtx: [switcher],
} = page

useHead({
  titleTemplate: `%s - ${appConf.title}`,
  title: computed(
    () =>
      `${page.user?.name} | ${switcher.mode} | ${switcher.ruleset} | ${switcher.rankingSystem}`
  ),
})

// directive is not working: yield error when navigate to other page
const visible = reactive({
  heading: false,
  statistics: false,
  bestScores: false,
  topScores: false,
})
const icons: Partial<Record<keyof typeof visible, string>> = {
  topScores: 'fa-solid fa-ranking-star',
  bestScores: 'fa-brands fa-pied-piper-pp',
  statistics: 'fa-solid fa-bars-staggered',
  heading: 'fa-solid fa-house-user',
}
const [handle, heading, statistics, bestScores, topScores] = [
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
  shallowRef<HTMLElement | null>(null),
]
onMounted(() => {
  if (handle.value) {
    setScroll(handle.value)
  }
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

<template>
  <div ref="handle" class="handle">
    <section v-if="page.error" class="min-h-screen">
      <div class="mx-auto my-auto flex flex-col justify-between gap-3">
        <h1 class="self-center text-3xl">
          Oops...
        </h1>
        <h2 v-if="page.error.message !== ''" class="self-center text-2xl">
          {{ page.error.message }}
        </h2>
        <h2 v-else class="self-center text-2xl">
          something went wrong.
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <t-button variant="primary" @click="$router.back()">
            bring me back
          </t-button>
          <t-button variant="secondary" @click="page.refresh">
            try again
          </t-button>
        </div>
      </div>
    </section>
    <div v-else-if="page.user" class="flex flex-col mt-20 justify-stretch md:mt-0">
      <userpage-heading id="heading" ref="heading" />
      <userpage-profile />
      <userpage-ranking-system-switcher class="z-10" />
      <div class="container custom-container mx-auto">
        <userpage-statistics id="statistics" ref="statistics" />
        <userpage-score-rank-composition />
      </div>
      <div id="bestScores" ref="bestScores" class="container custom-container mx-auto py-2">
        <userpage-best-scores v-if="page.currentRankingSystem" />
      </div>
      <div id="topScores" ref="topScores" class="container custom-container mx-auto py-4">
        <userpage-top-scores v-if="page.currentRankingSystem" />
      </div>
      <!-- placeholder for bottom nav -->·
      <div class="my-8 -z-50" />
      <!-- <client-only>
        <teleport to="#footer">

        </teleport>
      </client-only> -->
      <div class="btm-nav fuck">
        <template v-for="(isVisible, el) of visible" :key="el">
          <a
            v-if="icons[el]"
            :class="{
              active: isVisible,
            }" :href="`#${el}`"
          >
            <font-awesome-icon :icon="icons[el]" class="fa-xl" />
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
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.handle {
  /* @apply bg-gradient-to-b from-gbase-50/50 to-gbase-50/90 dark:from-gbase-800 dark:to-gbase-900; */
  @apply h-screen overflow-scroll
}
.fuck {
  justify-content: center;
}
.fuck > * {
  @apply md:basis-32
}
</style>
