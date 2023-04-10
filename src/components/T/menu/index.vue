<script setup lang="ts">

</script>

<template>
  <v-dropdown
    theme="guweb-dropdown"
    placement="auto"
    :distance="6"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </v-dropdown>
</template>

<style scoped>

</style>
