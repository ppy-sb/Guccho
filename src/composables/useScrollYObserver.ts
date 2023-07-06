const scrollY = ref(0)
let done = false
if (process.client && !done) {
  window.addEventListener('scroll', () => (scrollY.value = window.scrollY))
  done = true
}

export default function () {
  return computed(() => scrollY.value)
}
