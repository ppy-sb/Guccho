<template>
  <section
    class="custom-container"
  >
    <div class="shadow-lg card bg-kimberly-300/30">
      <div class="justify-center p-2 card-title">
        Top Performance (dummy)
      </div>
      <div class="p-4 card-body">
        <div v-for="i in 10" :key="i" class="score">
          <app-score />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import 'vue3-json-viewer/dist/index.css'
const user = inject('user')
</script>
