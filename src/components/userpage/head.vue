<template>
  <section
    class="flex flex-col items-center w-full mx-auto mt-5 md:container custom-container md:mt-20 md:flex-row md:items-end gap-5 root"
  >
    <!-- Logo -->
    <div>
      <img :src="user.avatarUrl" class="mask mask-squircle" width="300">
    </div>
    <!-- info -->
    <div
      class="flex flex-col w-full pt-4 md:p-0 bg-kimberly-200 dark:bg-kimberly-700 md:bg-transparent md:grow"
    >
      <template v-if="session.loggedIn">
        <div
          v-if="session.userId !== user.id"
          class="actions container flex justify-around order-3 pb-4 mx-auto md:order-1 md:justify-end gap-3 md:pb-0"
        >
          <t-button size="sm" variant="primary">
            add as friend
          </t-button>
          <t-button size="sm" variant="secondary">
            send message
          </t-button>
        </div>
        <div v-else class="actions container flex justify-around order-3 pb-4 mx-auto md:order-1 md:justify-end gap-3 md:pb-0">
          <t-nuxt-link-button
            size="sm"
            variant="primary"
            :to="{
              name: 'me-preferences'
            }"
          >
            change preferences
          </t-nuxt-link-button>
        </div>
      </template>
      <div
        class="container mx-auto sm:order-2 sm:flex sm:gap-1 sm:items-end sm:justify-between md:pb-2"
      >
        <div>
          <div>
            <h1 class="text-5xl text-center md:text-left">
              {{ user.name }}
            </h1>
            <h2
              class="text-3xl text-center underline md:text-left decoration-sky-500 text-kimberly-600 dark:text-kimberly-300"
            >
              @{{ user.safeName }}
            </h2>
            <div class="pb-2" />
          </div>
        </div>
        <app-mode-switcher class="self-end" />
      </div>
      <div class="order-3 user-status">
        currently offline.
      </div>
    </div>
  </section>
</template>

<script setup>
import { useSession } from '~/store/session'
const session = useSession()
const user = inject('user')
</script>

<style scoped lang="scss">
.user-status {
  @apply text-center text-kimberly-600 dark:text-kimberly-400 bg-kimberly-200/50 dark:bg-kimberly-700/50 px-2;
  @apply md:text-left md:rounded;
  @apply md:[margin-left:-7em] md:[padding-left:7em];
}
.root {
  .actions {
    filter: blur(0.2em) opacity(0);
    transform: scale(1.05);
    @apply transition-all;
  }

  &:hover {
    .actions {
      transform: scale(1) translateY(-0.2em);
      filter: blur(0) opacity(1);
      @apply transition-all;
    }
  }
}
</style>
