<script setup lang="ts">
const value = ref('test')

// js
const resizeJS = useTemplateRef('autosize-text')
const resizeContainer = useTemplateRef('autosize-container')

watch(value, resize)
window.addEventListener('resize', resize)

async function resize() {
  await nextTick()
  if (!resizeJS.value || !resizeContainer.value) {
    return
  }

  resizeJS.value.style.scale = ''
  resizeJS.value.style.background = ''

  const width = resizeJS.value.offsetWidth // reflow
  const parentWidth = resizeContainer.value.offsetWidth

  if (width >= parentWidth) {
    resizeContainer.value.style.scale = `${parentWidth / width}`
    resizeContainer.value.style.transformOrigin = 'left center'
  }
}
</script>

<template>
  <div class="container mx-auto max-w-screen-xl">
    <h1 class="text-3xl mb-4">
      autosize
    </h1>
    <input v-model="value" type="text" class="input">

    <h2 class="text-lg">
      svg
    </h2>
    <div class="mt-4 flex  border rounded-sm">
      <div v-for="char in value" :key="char">
        <svg class="" width="100%" height="100%" viewBox="0 0 60 80" style="fill: currentColor">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="500%">{{ char }}</text>
        </svg>
      </div>
    </div>
    <h2 class="text-lg">
      JS
    </h2>
    <div class="mt-4  border rounded-sm max-w-max">
      <div ref="autosize-container">
        <span ref="autosize-text" class="text-4xl">{{ value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
