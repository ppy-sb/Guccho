<script setup lang="ts">
import { useAppConfig } from '#app'

const config = useAppConfig()
</script>

<template>
  <client-only>
    <teleport :to="`#${config.appModalTeleportTargetId}`">
      <slot />
    </teleport>
  </client-only>
</template>
