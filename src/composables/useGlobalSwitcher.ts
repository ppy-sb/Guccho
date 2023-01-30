import { useLeaderboardSwitcher } from './useSwitcher'

let switcherContext: ReturnType<typeof useLeaderboardSwitcher>
const created = false
export default function useGlobalSwitcher(
  initial: Parameters<typeof useLeaderboardSwitcher>[0],
) {
  if (!created) {
    switcherContext = useLeaderboardSwitcher(initial)
  }
  return switcherContext
}
