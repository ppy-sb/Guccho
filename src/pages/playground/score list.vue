<template>
  <div class="container mx-auto flex flex-col lg:flex-row">
    <div class="lg:w-1/3">
      <div class="card bg-kimberly-100/20 shadow-lg">
        <div class="card-title bg-kimberly-200/40 p-2 justify-center">
          Top Performance
        </div>
        <div class="card-body p-4">
          <div v-for="i in 3" :key="i" class="score">
            <app-score />
          </div>
        </div>
      </div>
    </div>
    <div class="lg:w-2/3">
      <div class="card bg-kimberly-300/30 shadow-lg">
        <div class="card-title bg-kimberly-50/60 p-2 justify-center">
          Top Performance
        </div>
        <div class="card-body p-4">
          <div v-for="i in 3" :key="i" class="score">
            <app-score />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.score + .score {
  @apply border-t-2 border-kimberly-300/50 pt-2
}
</style>
