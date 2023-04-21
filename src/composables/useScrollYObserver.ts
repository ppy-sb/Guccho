const el = shallowRef<Element | Document>()
const scrollY = shallowRef(0)
function observer(e: Event | Document) {
  if (e instanceof Document) {
    scrollY.value = window.pageYOffset
  }
  else if (e.target instanceof Element) {
    scrollY.value = e.target?.scrollTop
  }
  else {
    throw new TypeError('unknown source')
  }
}
function setElement(element: Element | Document) {
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
export default function () {
  // onBeforeMount(() => {
  //   setElement(document)
  // })

  return [scrollY, setElement] as const
}
