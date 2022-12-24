<script setup lang="ts">
const config = useAppConfig()
</script>

<template>
  <teleport :to="`#${config.appModalTeleportTargetId}`">
    <slot />
  </teleport>
</template>
