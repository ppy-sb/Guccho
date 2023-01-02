import { useOverallSwitcher } from './useSwitcher'

let switcherContext: ReturnType<typeof useOverallSwitcher>
const created = false
export default function useGlobalSwitcher(initial: Parameters<typeof useOverallSwitcher>[0]) {
  if (!created)
    switcherContext = useOverallSwitcher(initial)
  return switcherContext
}
