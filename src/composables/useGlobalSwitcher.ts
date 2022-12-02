let switcherContext: ReturnType<typeof useSwitcher>
const created = false
export default function useGlobalSwitcher(initial: Parameters<typeof useSwitcher>[0]) {
  if (!created)
    switcherContext = useSwitcher(initial)
  return switcherContext
}
