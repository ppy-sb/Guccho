<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import {
  faBarsStaggered,
  faHouseUser,
  faRankingStar,
} from '@fortawesome/free-solid-svg-icons'
import { faPiedPiperPp } from '@fortawesome/free-brands-svg-icons'
import userpageStore from '~/store/userpage'

const { addToLibrary } = useFAIcon()

addToLibrary(faRankingStar, faPiedPiperPp, faBarsStaggered, faHouseUser)

const appConf = useAppConfig()

const page = userpageStore()

await page.refresh()

useHead({
  titleTemplate: `%s - ${appConf.title}`,
  title: computed(
    () =>
      `${page.user?.name} | ${page.switcher.mode} | ${page.switcher.ruleset} | ${page.switcher.rankingSystem}`
  ),
})

// directive is not working: yield error when navigate to other page
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

<template>
  <section v-if="page.error" class="grow flex">
    <div class="m-auto flex flex-col items-center justify-center gap-3">
      <h1 class="text-3xl">
        Oops...
      </h1>
      <h2 v-if="page.error.message !== ''" class="text-2xl">
        {{ page.error.message }}
      </h2>
      <h2 v-else class="text-2xl">
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

  <div v-else-if="page.user" ref="handle" class="flex flex-col mt-20 justify-stretch md:mt-0">
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
    <!-- <div class="my-8 -z-50" /> -->
    <!-- <client-only>
      <teleport to="body">

      </teleport>
    </client-only> -->
    <div class="btm-nav sticky fuck">
      <template v-for="(isVisible, el) of visible" :key="el">
        <a
          v-if="icons[el]"
          :class="{
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
  </div>
</template>

<style lang="postcss" scoped>
.fuck {
  justify-content: center;
}
.fuck > * {
  @apply md:basis-32
}
</style>
