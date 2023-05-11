// let el: Element | Document | undefined
// let observed: EventListenerOrEventListenerObject | undefined

const scrollY = shallowRef(0)

function observeDocument() {
  scrollY.value = window.pageYOffset
}

// function observeElement() {
//   scrollY.value = (el as Element)?.scrollTop
// }
// function dispatch() {
//   if (el instanceof Document) {
//     el.addEventListener('scroll', observeDocument)
//   }
//   else if (el instanceof Element) {
//     el.addEventListener('scroll', observeElement)
//   }
//   else {
//     throw new TypeError('unknown source')
//   }
// }

// function setElement(element: Element | Document) {
//   if (observed) {
//     el?.removeEventListener('scroll', observed)
//   }
//   el = element
//   dispatch()

//   onBeforeUnmount(() => {
//     if (observed) {
//       el?.removeEventListener('scroll', observed)
//     }
//     scrollY.value = 0
//   })
// }

export default function () {
  onBeforeMount(() => {
    document.addEventListener('scroll', observeDocument)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('scroll', observeDocument)
  })
  return [
    scrollY,
    // setElement,
    // el,
  ] as const
}
