<script setup lang="ts">
const { $client } = useNuxtApp()
const route = useRoute()
const { data: beatmapset, error } = await useAsyncData(async () => await $client.map.beatmapset.query({ id: route.params.id.toString() }))
const selectedMapId = ref<unknown>(beatmapset.value?.beatmaps[0].id)
const selectedMap = computed(() => beatmapset.value?.beatmaps.find(bm => bm.id === selectedMapId?.value))
</script>

<template>
  <section v-if="error" class="section custom-container mx-auto">
    <div>
      {{ error?.message }}
    </div>
  </section>
  <div v-else-if="beatmapset">
    <div class="container custom-container mx-auto">
      <div class="header-with-maps">
        <div class="text-center">
          <h1
            class="text-3xl font-bold text-center sm:text-left"
          >
            {{ beatmapset.meta.intl.title }}
          </h1>
          <h2
            class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left"
          >
            by {{ beatmapset.meta.intl.artist }}
          </h2>
        </div>
        <t-tabs v-model="selectedMapId" variant="lifted" size="sm" class="self-end">
          <t-tab v-for="bm in beatmapset.beatmaps" :key="bm.id" :value="bm.id">
            {{ bm.version }}
          </t-tab>
        </t-tabs>
      </div>
      <div class="card bg-neutral rounded-tr-none">
        <div class="card-body">
          {{ selectedMap }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.header-with-maps {
  @apply sm:flex mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100;
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100 ; */
  transition: 0.3s ease;
  @apply pb-0;

  @apply md:pt-20;
}
</style>

