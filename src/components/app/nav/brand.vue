<script setup>
const s = useRuntimeConfig()
</script>

<template>
  <nuxt-link-locale :to="{ name: 'index' }" class="gap-1 text-xl normal-case btn btn-ghost">
    <icon v-if="s.public.brand" :name="s.public.brand.icon" />
    {{ $t('server.name') }}
  </nuxt-link-locale>
</template>
