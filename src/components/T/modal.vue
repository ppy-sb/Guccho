<template>
  <div class="zoom-modal-content">
    <div class="card bg-ebony-clay-800 shadow-xl">
      <div class="card-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="postcss" scoped>
.zoom-modal-content {
  @apply h-screen m-auto flex items-center justify-center
}
</style>
