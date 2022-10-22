<script setup>
import { scoped } from '@/prototyping/objects/user'
const layout = ref('list')
const user = scoped.demoUser
</script>
<template>
  <div class="container custom-container mx-auto pt-24">
    <t-tabs v-model="layout" size="lg" variant="bordered">
      <t-tab value="list" :active="layout === 'list'">
        list
      </t-tab>
      <t-tab value="grid" :active="layout === 'grid'">
        grid
      </t-tab>
    </t-tabs>
    <div v-if="layout === 'list'" class="max-w-4xl mx-auto user-list">
      <div
        v-for="i in 4"
        :key="i"
        class="user-list-item w-full p-2"
      >
        <div
          class="flex gap-2 justify-center md:justify-start items-center face"
        >
          <div class="relative mask mask-squircle z-10 hoverable w-100">
            <img
              src="/images/1.png"
              class="pointer-events-none w-14 md:w-[4em]"
            >
          </div>
          <div class="grow">
            <h1 class="text-2xl md:text-4xl text-left">
              {{ user.name }}
            </h1>
            <div class="flex justify-between w-full items-top">
              <a
                class="text-lg md:text-2xl text-left underline decoration-sky-500 text-kimberly-600 dark:text-kimberly-300 hover:text-kimberly-500"
                href="#"
              >
                @{{ user.safeName }}
              </a>
              <div class="flex gap-2 actions">
                <t-button variant="info" size="xs" class="md:btn-sm">
                  chat
                </t-button>
                <t-button variant="warning" size="xs" class="md:btn-sm">
                  remove friend
                </t-button>
              </div>
            </div>
          </div>
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
    }
    .actions {
      filter: blur(0.3em) opacity(0) saturate(0);
      transform: scale(1.05);
      @apply transition-all;
    }
    &:hover {
      .face {
        transform: translateY(-0.2em);
        @apply drop-shadow-xl;
        @apply transition-all;
      }
      .actions {
        transform: scale(1) translateY(-0.2em);
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
