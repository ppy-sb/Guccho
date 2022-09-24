<template>
  <client-only>
    <teleport :to="`#${config.appModalTeleportTargetId}`">
      <slot />
    </teleport>
  </client-only>
</template>

<script setup>
import { useAppConfig } from 'nuxt/app'

const config = useAppConfig()
</script>
