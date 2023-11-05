import type { inferRouterError, inferRouterOutputs } from '@trpc/server'
import { defineStore } from 'pinia'
import type { WatchStopHandle } from 'vue'
import { Mode, Ruleset } from '~/def'
import type { AppRouter } from '~/server/trpc/routers'

type RouterOutput = inferRouterOutputs<AppRouter>
type RouterError = inferRouterError<AppRouter>

export default defineStore('userpage', () => {
  const { hasRuleset } = useAdapterConfig()

  const app = useNuxtApp()

  const error = shallowRef<{ message: string } | null>(null)
  const user = shallowRef<RouterOutput['user']['userpage'] | null>(null)

  const switcherCtx = useLeaderboardSwitcher()
  const [switcher, setSwitcher] = switcherCtx

  const _computeStatistic = () => hasRuleset(switcher.mode, switcher.ruleset)
    ? user.value?.statistics?.[switcher.mode][switcher.ruleset]
    : user.value?.statistics?.[Mode.Osu][Ruleset.Standard]

  const currentStatistic = shallowRef<ReturnType<typeof _computeStatistic> | null>(null)

  const _computeRankingSystem = () => currentStatistic.value?.[switcher.rankingSystem]

  const currentRankingSystem = shallowRef<ReturnType<typeof _computeRankingSystem> | null>(null)

  let dispose: WatchStopHandle = () => {}

  async function init() {
    const route = useRoute('user-handle')
    try {
      const u = await app.$client.user.userpage.query({
        handle: `${route.params.handle}`,
      })
      user.value = u
      dispose()
      setSwitcher(u.preferredMode)
      currentStatistic.value = _computeStatistic()
      currentRankingSystem.value = _computeRankingSystem()
      error.value = null

      dispose = watch([
        () => switcher.mode,
        () => switcher.ruleset,
      ], refresh)
    }
    catch (e) {
      console.error(e)
      error.value = {
        message: (e as RouterError).message,
      }
    }
  }

  async function refresh() {
    const route = useRoute('user-handle')
    try {
      const u = await app.$client.user.userpage.query({
        handle: `${route.params.handle}`,
      })
      user.value = u
      currentStatistic.value = _computeStatistic()
      currentRankingSystem.value = _computeRankingSystem()
      error.value = null
    }
    catch (e) {
      console.error(e)
      error.value = {
        message: (e as RouterError).message,
      }
    }
  }

  return {
    refresh,
    dispose,
    init,
    error,
    user,
    switcher,
    setSwitcher,
    currentStatistic,
    currentRankingSystem,
  }
})
