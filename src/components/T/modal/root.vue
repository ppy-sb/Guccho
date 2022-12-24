<script setup lang="ts">
const config = useAppConfig()
</script>

<template>
  <client-only>
    <teleport :to="`#${config.appModalTeleportTargetId}`">
      <slot />
    </teleport>
  </client-only>
</template>
