<template>
  <div class="absolute inset-0 flex overflow-clip">
    <div class="w-full flex flex-col items-center justify-center">
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
