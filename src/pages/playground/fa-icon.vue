<script setup>
import { faEdit } from '@fortawesome/free-solid-svg-icons'
const { addToLibrary } = useFAIconLib()

addToLibrary(faEdit)
</script>

<template>
  <div class="container mx-auto custom-container">
    <font-awesome-icon icon="fas fa-edit" />
  </div>
</template>

<style lang="scss" scoped>

</style>
