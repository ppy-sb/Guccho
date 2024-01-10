<script setup lang="ts">

</script>

<template>
  <v-dropdown
    theme="guccho-dropdown"
    placement="auto"
    :distance="6"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData" :key="name">
      <slot v-bind="slotData" :key="name" :name="name" />
    </template>
  </v-dropdown>
</template>

<style scoped>

</style>
