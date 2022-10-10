<script setup>
import { scoped } from '@/prototyping/objects/user'
const layout = ref('list')
const user = scoped.demoUser
</script>
<template>
  <div class="container mx-auto pt-24 lg:px-4">
    <t-tabs v-model="layout" size="lg" variant="bordered">
      <t-tab value="list" :active="layout === 'list'">
        list
      </t-tab>
      <t-tab value="grid" :active="layout === 'grid'">
        grid
      </t-tab>
    </t-tabs>
    <div v-if="layout === 'list'" class="w-full user-list">
      <div
        v-for="i in 4"
        :key="i"
        class="user-list-item w-full p-2 flex justify-between items-center"
      >
        <div
          class="flex gap-4 justify-center md:justify-start items-center face"
        >
          <div class="relative mask mask-squircle z-10 hoverable w-100">
            <img
              src="/images/1.png"
              class="pointer-events-none"
              style="min-width: 75px; width: 75px"
            >
          </div>
          <div>
            <h1 class="text-4xl text-left">
              {{ user.name }}
            </h1>
            <a
              class="text-2xl text-left underline decoration-sky-500 text-kimberly-600 dark:text-kimberly-300 hover:text-kimberly-500"
              href="#"
            >
              @{{ user.safeName }}
            </a>
          </div>
        </div>
        <div class="flex gap-2 actions">
          <t-button variant="info" size="sm">
            chat
          </t-button>
          <t-button variant="warning" size="sm">
            remove friend
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.user-list {
  .user-list-item {
    .face {
      @apply transition-all;
      @apply drop-shadow-sm;
      transform: scale(0.98);
    }
    .actions {
      filter: blur(0.4em) opacity(0) saturate(0);
      transform: scale(1.2) translateX(-3em) translateY(0.2em);
      @apply transition-all;
    }
    &:hover {
      .face {
        transform: scale(1);
        @apply drop-shadow-xl;
        @apply transition-all;
      }
      .actions {
        transform: scale(1);
        filter: blur(0) opacity(1) saturate(1);
        @apply transition-all;
      }

    }
    & + .user-list-item {
      @apply border-t-2 border-kimberly-500/30;
    }
  }
}
</style>
