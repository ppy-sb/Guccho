import { defineStore } from 'pinia'

export default defineStore('userpage', () => {
  const { hasRuleset } = useAdapterConfig()
  const route = useRoute()

  const app = useNuxtApp()

  const switcherCtx = useLeaderboardSwitcher()
  const [switcher] = switcherCtx

  const { data: user, error, refresh } = useAsyncData(() => app.$client.user.userpage.query({
    handle: `${route.params.handle}`,
  }))

  const currentStatistic = computed(() => {
    const returnValue = hasRuleset(switcher.mode, switcher.ruleset)
      ? user.value?.statistics?.[switcher.mode][switcher.ruleset]
      : user.value?.statistics?.osu.standard
    if (!returnValue) {
      throw new Error('unknown mode & ruleset')
    }
    return returnValue
  })
  const currentRankingSystem = computed(
    () => currentStatistic.value?.[switcher.rankingSystem],
  )

  return {
    error,
    refresh,
    user,
    switcherCtx,
    switcher,
    setSwitcher: switcherCtx[1],
    currentStatistic,
    currentRankingSystem,
  }
})
