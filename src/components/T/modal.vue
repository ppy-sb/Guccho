<template>
  <div class="zoom-modal-inner">
    <slot name="root">
      <div
        class="shadow-xl card bg-gbase-50 dark:bg-gbase-800 shadow-gbase-800/20"
      >
        <slot name="body">
          <div class="card-body" v-bind="$attrs">
            <slot />
          </div>
        </slot>
      </div>
    </slot>
  </div>
</template>

<style lang="postcss" scoped>
.zoom-modal-inner {
  @apply min-h-screen m-auto flex items-center justify-center;
}
</style>
