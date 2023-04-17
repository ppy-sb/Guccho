import type { inferRouterError, inferRouterOutputs } from '@trpc/server'
import { defineStore } from 'pinia'
import type { AppRouter } from '~/server/trpc/routers'

type RouterOutput = inferRouterOutputs<AppRouter>
type RouterError = inferRouterError<AppRouter>

export default defineStore('userpage', () => {
  const { hasRuleset } = useAdapterConfig()

  const app = useNuxtApp()

  const switcherCtx = useLeaderboardSwitcher()
  const [switcher] = switcherCtx

  const error = shallowRef<RouterError | null>(null)
  const user = shallowRef<RouterOutput['user']['userpage']>()

  const _computeStatistic = () => hasRuleset(switcher.mode, switcher.ruleset)
    ? user.value?.statistics?.[switcher.mode][switcher.ruleset]
    : user.value?.statistics?.osu.standard

  const currentStatistic = shallowRef(_computeStatistic())

  const _computeRankingSystem = () => currentStatistic.value?.[switcher.rankingSystem]

  const currentRankingSystem = shallowRef(_computeRankingSystem())

  const refresh = async () => {
    error.value = null
    const route = useRoute()
    user.value = await app.$client.user.userpage.query({
      handle: `${route.params.handle}`,
    }).catch((_e) => {
      error.value = _e
      return undefined
    })
    currentStatistic.value = _computeStatistic()
    currentRankingSystem.value = _computeRankingSystem()
  }

  watch([
    () => switcher.mode,
    () => switcher.ruleset,
  ], refresh)

  return {
    refresh,
    error,
    user,
    switcherCtx,
    switcher,
    setSwitcher: switcherCtx[1],
    currentStatistic,
    currentRankingSystem,
  }
})
