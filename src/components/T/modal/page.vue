<template>
  <client-only>
    <teleport :to="`#${config.appModalTeleportTargetId}`">
      <slot />
    </teleport>
  </client-only>
</template>

<script setup lang="ts">
import { useAppConfig } from 'nuxt/app'

const config = useAppConfig()
</script>
