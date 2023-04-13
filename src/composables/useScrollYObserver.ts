const el = ref<Element>()
const scrollY = ref(0)
function observer(e: Event) {
  if (!(e.target instanceof Element)) {
    return
  }
  scrollY.value = e.target?.scrollTop
}
function handleScroll() {
  scrollY.value = window.pageYOffset
}

export default function () {
  onBeforeMount(() => {
    document.removeEventListener('scroll', handleScroll)
    document.addEventListener('scroll', handleScroll)
  })

  const setElement = (element: Element) => {
    if (el.value) {
      el.value.removeEventListener('scroll', observer)
    }
    el.value = element

    element.addEventListener('scroll', observer)

    onBeforeUnmount(() => {
      element.removeEventListener('scroll', observer)
      scrollY.value = 0
    })
  }

  return [scrollY, setElement] as const
}
