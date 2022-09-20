<template>
  <div>
    <section class="md:container mx-auto !mt-20 flex flex-col items-center md:flex-row md:items-end gap-5">
      <!-- Logo -->
      <div class="z-10">
        <img class="mask mask-squircle" src="https://via.placeholder.com/300.png">
      </div>
      <!-- info -->
      <div class="pt-4 flex flex-col md:p-0 w-full md:w-100 bg-ebony-clay-700 md:bg-transparent md:grow">
        <div class="order-3 md:order-1 container mx-auto flex md:justify-end sm:justify-start gap-3 pb-4 md:pb-0 px-4 md:px-0">
          <dv-button size="sm">
            add as friend
          </dv-button>
          <dv-button size="sm">
            send message
          </dv-button>
        </div>
        <div class="sm:order-2 container mx-auto sm:flex sm:gap-1 sm:items-end sm:justify-between md:pb-2">
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
        <div class="user-status order-3">
          currently offline.
        </div>
      </div>
    </section>
    <section class="pt-4">
      <div class="container mx-auto">
        <t-tabs v-model="tab" variant="bordered">
          <t-tab
            v-for="(stats, key) of user.statistics[selectedMode][selectedRuleset].ranking"
            :key="`user-tab-${key}`"
            class="md:tab-lg"
            :value="`user-tab-${key}`"
          >
            {{ rankingSystem[key] }}
          </t-tab>
          <t-tab disabled class="grow" />
        </t-tabs>
      </div>
    </section>
    <div class="pt-20">
      debug:
      {{ user }}
    </div>
  </div>
</template>

<script setup>
import { demoUser as user } from '@/prototyping/objects/user'
const tab = ref('1')
const selectedMode = ref('osu')
const selectedRuleset = ref('standard')
const { rankingSystem } = useRuntimeConfig()
</script>

<style scoped lang="postcss">
.user-status {
  @apply text-center text-ebony-clay-400 bg-ebony-clay-800 px-2;
  @apply md:text-left md:rounded md:-mr-1;
  @apply md:[margin-left:-7em] md:[padding-left:7em]
}
</style>
