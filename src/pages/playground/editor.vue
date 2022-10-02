<template>
  <div class="container mx-auto">
    <lazy-editor v-model="html" @click.prevent="" />

    <div>{{ html }}</div>
  </div>
</template>

<script setup>
const html = ref('')
</script>

<style lang="scss" scoped>

</style>
