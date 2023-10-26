<script setup lang="ts">
const fullYear = new Date().getFullYear()
</script>

<template>
  <div class="flex flex-col min-h-[100dvh]">
    <div class="grow flex flex-col items-center">
      <slot />
      <slot name="footer">
        <footer class="py-4 text-center relative">
          <h1
            class="text-sm font-semibold text-gbase-900 dark:text-gbase-100"
          >
            © {{ fullYear }} ppy.sb | Varkaria
          </h1>
        </footer>
      </slot>
    </div>
  </div>
</template>
