<script lang="ts" setup>
const [_, setScroll] = useScrollYObserver()

const scroll = shallowRef<HTMLElement>()

onMounted(() => {
  scroll.value && setScroll(scroll.value)
})
</script>

<template>
  <div ref="scroll" class="h-[100dvh] overflow-scroll" viewport>
    <div class="flex flex-col min-h-full flex-grow">
      <slot />
      <slot name="footer">
        <footer class="py-4 text-center relative">
          <h1
            class="text-sm font-semibold text-gbase-900 dark:text-gbase-100"
          >
            © {{ new Date().getFullYear() }} ppy.sb | Varkaria
          </h1>
        </footer>
      </slot>
    </div>
  </div>
</template>

<style scoped>
[viewport] {
  -webkit-overflow-scrolling: touch;
  /* overscroll-behavior: none; */
}
</style>
