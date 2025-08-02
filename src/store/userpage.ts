import type { inferRouterError, inferRouterOutputs } from '@trpc/server'
import { defineStore } from 'pinia'
import type { WatchStopHandle } from 'vue'
import type { LeaderboardRankingSystem } from '$active'
import type { RouteLocationRaw } from '#vue-router'
import { type SwitcherPropType } from '~/composables/useSwitcher'
import { Mode, Ruleset } from '~/def'
import type { AppRouter } from '~/server/trpc/routers'

type RouterOutput = inferRouterOutputs<AppRouter>
type RouterError = inferRouterError<AppRouter>

export default defineStore('userpage', () => {
  const { hasRuleset } = useAdapterConfig()

  const app = useNuxtApp()
  const router = useRouter()

  const error = shallowRef<{ message: string } | null>(null)
  const user = shallowRef<RouterOutput['user']['userpage'] | null>(null)

  const switcherCtx = useLeaderboardSwitcher()
  const [switcher, setSwitcher] = switcherCtx

  const currentStatistic = shallowRef<RouterOutput['user']['statistic']>()
  const statisticLoadingState = shallowRef(false)
  const currentRankingSystem = shallowRef<ReturnType<typeof computeRankingSystem>>()

  let dispose: WatchStopHandle[] = []

  async function getStatistic() {
    if (!user.value) {
      return
    }
    statisticLoadingState.value = true
    try {
      if (!hasRuleset(switcher.mode, switcher.ruleset)) {
        return await app.$client.user.statistic.query({ id: user.value!.id, mode: Mode.Osu, ruleset: Ruleset.Standard, rankingSystem: switcher.rankingSystem })
      }
      return await app.$client.user.statistic.query({ id: user.value!.id, mode: switcher.mode, ruleset: switcher.ruleset, rankingSystem: switcher.rankingSystem })
    }
    catch (e) {
      console.error(e)
      error.value = {
        message: (e as RouterError).message,
      }
    }
    finally {
      statisticLoadingState.value = false
    }
  }

  async function initServer(initSwitcher?: SwitcherPropType<LeaderboardRankingSystem>) {
    const route = useRoute('user-handle')
    try {
      const u = await app.$client.user.userpage.query({
        handle: `${route.params.handle}`,
      })
      user.value = u

      if (initSwitcher?.mode || initSwitcher?.ruleset || initSwitcher?.rankingSystem) {
        setSwitcher(initSwitcher)
      }
      else {
        setSwitcher({
          rankingSystem: initSwitcher?.rankingSystem,
          ...u.preferredMode,
        })
      }

      currentStatistic.value = await getStatistic()
      currentRankingSystem.value = computeRankingSystem()
      error.value = null
    }
    catch (e) {
      console.error(e)
      error.value = {
        message: (e as RouterError).message,
      }
    }
  }
  async function initClient() {
    const route = useRoute('user-handle')
    dispose.forEach(cb => cb())
    try {
      dispose = [
        watch([
          () => switcher.mode,
          () => switcher.ruleset,
        ], async () => {
          currentStatistic.value = await getStatistic()
          currentRankingSystem.value = computeRankingSystem()
        }),
        watch(() => switcher.rankingSystem, () => {
          currentRankingSystem.value = computeRankingSystem()
        }),

        watch(switcher, () => {
          const l = window.location
          const r = router.resolve(createUserpageRoute({ ...switcher, handle: route.params.handle }))

          const rewrite = l.origin + r.fullPath
          history.pushState({}, '', rewrite)
        }),
      ]
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
      currentStatistic.value = await getStatistic()
      currentRankingSystem.value = computeRankingSystem()
      error.value = null
    }
    catch (e) {
      console.error(e)
      error.value = {
        message: (e as RouterError).message,
      }
    }
  }

  function computeRankingSystem() {
    return currentStatistic.value?.[switcher.rankingSystem]
  }

  return {
    refresh,
    dispose,
    initServer,
    initClient,
    error,
    user,
    switcher,
    setSwitcher,
    currentStatistic,
    statisticLoadingState,
    currentRankingSystem,
  }
})

export function createUserpageRoute(i: SwitcherPropType<LeaderboardRankingSystem> & { handle: string }) {
  return {
    name: 'user-handle',
    params: { handle: i.handle },
    query: {
      rank: i.rankingSystem,
      ruleset: i.ruleset,
      mode: i.mode,
    },
  } as RouteLocationRaw
}
