<template>
  <div>
    <section class="md:container mx-auto !mt-20 flex flex-col items-center md:flex-row md:items-end gap-5">
      <!-- Logo -->
      <div class="z-10">
        <img class="mask mask-squircle" src="https://via.placeholder.com/300.png">
      </div>
      <!-- info -->
      <div class="pt-4 md: p-0 w-full md:w-100 bg-ebony-clay-700 md:bg-transparent md:grow">
        <div class="container mx-auto flex gap-1 items-end justify-between md:pb-2 md:flex">
          <div>
            <div>
              <h1 class="text-5xl text-center md:text-left">
                {{ user.name }}
              </h1>
              <h2 class="text-3xl text-center md:text-left underline decoration-sky-500 text-ebony-clay-300">
                @{{ user.safeName }}
              </h2>
              <div class="pb-2" />
            </div>
          </div>
          <c-mode-switcher class="self-end" />
        </div>
        <div class="text-center md:text-left text-ebony-clay-500 bg-ebony-clay-800 px-2 md:rounded md:pl-20 md:-ml-20 md:-mr-1">
          currently offline fhdsuioafhdsauiof hdsauiofh dsauiof hdsuiof hsdaiuf hdsauifo asdhf iuoasdhiu
        </div>
      </div>
    </section>
    <section class="pt-4">
      <div class="container mx-auto">
        <dv-tabs v-model:value="tab" type="lifted" size="lg">
          <dv-tab
            v-for="(stats, key) of user.statistics[selectedMode][selectedRuleset].ranking"
            :key="`user-tab-${key}`"
            :name="`user-tab-${key}`"
            :title="key"
          />
          <!-- <dv-tab name="1" title="dv-tab 1">
            Content 1
          </dv-tab>
          <dv-tab name="2" title="dv-tab 2">
            Content 2
          </dv-tab>
          <dv-tab name="3" title="dv-tab 3">
            Content 3
          </dv-tab> -->
        </dv-tabs>
      </div>
    </section>
    <div class="pt-20">
      debug:
      {{ user }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { demoUser as user } from '@/prototyping/objects/user'
const tab = ref('1')
const selectedMode = ref('osu')
const selectedRuleset = ref('standard')
</script>

<style scoped>
</style>
