<script setup>
import { navigateTo, onErrorCaptured } from '#imports'
import { useSession } from '~/store/session'
const { $client } = useNuxtApp()
const session = useSession()

if (!session.$state.loggedIn) {
  await navigateTo({
    name: 'auth-login',
    query: {
      back: '1',
    },
  })
}
const relations = await $client.me.relations.query()

if (!relations) {
  throw new Error('user not exists')
}

const errorMessage = ref('')

onErrorCaptured((err) => {
  errorMessage.value = err.message || 'something went wrong.'
})

const layout = ref('list')
</script>

<template>
  <div class="container pt-24 mx-auto custom-container">
    <t-tabs v-model="layout" size="lg" variant="bordered">
      <t-tab value="list" :active="layout === 'list'">
        list
      </t-tab>
      <t-tab value="condensed" :active="layout === 'condensed'">
        condensed
      </t-tab>
    </t-tabs>
    <suspense>
      <template #fallback>
        <div>
          {{ errorMessage || "Loading..." }}
        </div>
      </template>
      <div v-if="layout === 'list'" class="mx-auto user-list">
        <div
          v-for="user in relations"
          :key="`relation-@${user.safeName}`"
          class="w-full p-2 user-list-item"
        >
          <div
            class="flex items-center justify-center gap-2 md:justify-start face"
          >
            <div class="relative z-10 mask mask-squircle hoverable">
              <img
                :src="user.avatarSrc"
                class="pointer-events-none w-14 md:w-[4em]"
              >
            </div>
            <div class="grow">
              <h1 class="text-2xl text-left md:text-4xl">
                {{ user.name }}
              </h1>
              <div class="flex justify-between w-full items-top">
                <nuxt-link
                  class="text-lg text-left underline md:text-2xl decoration-sky-500 text-kimberly-600 dark:text-kimberly-300 hover:text-kimberly-500"
                  :to="{
                    name: 'user-handle',
                    params: {
                      handle: `@${user.safeName}`,
                    },
                  }"
                >
                  @{{ user.safeName }}
                </nuxt-link>
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
    </suspense>
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
      filter: blur(0.2em) opacity(0);
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
        filter: blur(0) opacity(1);
        @apply transition-all;
      }
    }

    @apply border-b-2 border-kimberly-500/30;
  }
  @apply grid xl:grid-cols-2 gap-x-8;
}
</style>
