<script setup></script>

<template>
  <div class="zoom-modal-content">
    <slot name="root">
      <div
        class="shadow-xl card bg-kimberly-50 dark:bg-kimberly-800 shadow-kimberly-800/20"
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
.zoom-modal-content {
  @apply h-screen m-auto flex items-center justify-center;
}
</style>
