<template>
  <div class="container flex flex-col mx-auto lg:flex-row">
    <div class="lg:w-1/3">
      <div class="shadow-lg card bg-kimberly-100/20">
        <div class="justify-center p-2 card-title bg-kimberly-200/40">
          Top Performance
        </div>
        <div class="p-4 card-body">
          <div v-for="i in 3" :key="i" class="score">
            <app-score />
          </div>
        </div>
      </div>
    </div>
    <div class="lg:w-2/3">
      <div class="shadow-lg card bg-kimberly-300/30">
        <div class="justify-center p-2 card-title bg-kimberly-50/60">
          Top Performance
        </div>
        <div class="p-4 card-body">
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
