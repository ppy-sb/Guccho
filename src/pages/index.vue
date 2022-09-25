<template>
  <div
    class="grow flex items-center"
  >
    <div
      class="container mx-auto w-max text-left text-kimberly-900 dark:text-kimberly-100 my-auto flex items-center justify-between"
    >
      <div class="content">
        <div class="mb-6">
          <h1 class="text-4xl text-center sm:text-left mb-2 font-bold">
            {{ config.title.toUpperCase() }}
          </h1>
          <h2 class="h-sub font-semibold text-md text-center sm:text-left">
            We are an osu! private server built from the ground up with many
            unique features not seen elsewhere - for more information, check out
            gulag and {{ config.title }} on GitHub - we're fully open source!
          </h2>
        </div>

        <div class="gap-2 flex">
          <t-nuxt-link-button
            :to="{name: 'auth-login'}"
            variant="primary"
          >
            Login
          </t-nuxt-link-button>

          <t-nuxt-link-button
            :to="{name: 'auth-register'}"
            variant="secondary"
          >
            Register
          </t-nuxt-link-button>
        </div>
      </div>
      <div class="mascot hidden lg:block">
        <img src="~/assets/mascot/riru.png" style="max-height:1000px" alt="riru Mascot" m="l-auto">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppConfig } from '#app'

const config = useAppConfig()
</script>

<style lang="postcss">
.h-sub {
  max-width: 32rem;
}

/* a.btn {
  @apply inline-flex justify-center w-full px-6 py-2 text-base font-medium
  text-kimberly-900 dark:text-kimberly-100 border border-transparent rounded-md shadow-md
  focus:outline-none w-auto
} */
</style>
