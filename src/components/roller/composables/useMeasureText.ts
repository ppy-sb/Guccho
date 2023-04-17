import type { Ref } from 'vue'
import { onMounted, watch } from 'vue'

/**

 */
export default function useMeasureText(
  itemElement: Ref<HTMLDivElement | null>,
) {
  const width = shallowRef(0)

  function updateWidth() {
    width.value = itemElement.value?.clientWidth || 16
  }

  onMounted(updateWidth)

  watch(itemElement, updateWidth)

  return { width }
}
