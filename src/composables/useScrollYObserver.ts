const el = ref<HTMLElement>()
const scrollY = ref(0)
function observer(e: Event) {
  if (!(e.target instanceof HTMLElement)) {
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
  // onBeforeUnmount(() => {
  //   scrollY.value = 0
  //   document.removeEventListener('scroll', handleScroll)
  // })

  // const pageObserver =

  const setElement = (element: HTMLElement) => {
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
