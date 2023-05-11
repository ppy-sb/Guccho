<template>
  <div>
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
</template>
