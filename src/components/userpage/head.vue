<template>
  <section
    class="md:container content-padding mx-auto mt-5 md:mt-20 flex flex-col items-center md:flex-row md:items-end gap-5"
  >
    <!-- Logo -->
    <div>
      <img class="mask mask-squircle" src="~/assets/images/1.png" width="300">
    </div>
    <!-- info -->
    <div
      class="pt-4 flex flex-col md:p-0 w-full md:w-100 bg-kimberly-300 dark:bg-kimberly-700 md:bg-transparent md:grow"
    >
      <div
        class="order-3 md:order-1 container mx-auto flex justify-around md:justify-end gap-3 pb-4 md:pb-0"
      >
        <dv-button size="sm" type="primary">
          add as friend
        </dv-button>
        <dv-button size="sm" type="secondary">
          send message
        </dv-button>
      </div>
      <div
        class="sm:order-2 container mx-auto sm:flex sm:gap-1 sm:items-end sm:justify-between md:pb-2"
      >
        <div>
          <div>
            <h1 class="text-5xl text-center md:text-left">
              {{ user.name }}
            </h1>
            <h2
              class="text-3xl text-center md:text-left underline decoration-sky-500 text-kimberly-600 dark:text-kimberly-300"
            >
              @{{ user.safeName }}
            </h2>
            <div class="pb-2" />
          </div>
        </div>
        <app-mode-switcher class="self-end" />
      </div>
      <div class="user-status order-3">
        currently offline.
      </div>
    </div>
  </section>
</template>

<script setup>
const user = inject('user')
</script>

<style scoped lang="postcss">
.user-status {
  @apply text-center text-kimberly-600 dark:text-kimberly-400 bg-kimberly-100 dark:bg-kimberly-800 px-2;
  @apply md:text-left md:rounded;
  @apply md:[margin-left:-7em] md:[padding-left:7em];
}
</style>
