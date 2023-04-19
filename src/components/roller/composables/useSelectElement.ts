import type { Ref } from 'vue'

export default function useSelectElement(
  itemElements: Ref<HTMLDivElement[]>,
  targetIdx: Ref<number>,
) {
  const itemElement: Ref<HTMLDivElement | null> = shallowRef(null)

  function updateItemElement() {
    itemElement.value = itemElements.value[targetIdx.value]
  }

  onMounted(updateItemElement)

  watch(targetIdx, () => {
    nextTick(updateItemElement)
  })

  return { itemElement }
}
