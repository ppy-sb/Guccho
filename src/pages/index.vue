<template>
  <div class="flex items-center grow ">
    <div
      class="container flex items-center justify-between mx-auto my-auto text-left custom-container w-max text-kimberly-900 dark:text-kimberly-100"
    >
      <div class="content">
        <div class="mb-6">
          <h1 class="mb-2 text-4xl font-bold text-center sm:text-left">
            {{ config.title.toUpperCase() }}
          </h1>
          <h2 class="font-semibold text-center h-sub text-md sm:text-left">
            We are an osu! private server built from the ground up with many
            unique features not seen elsewhere - for more information, check out
            gulag and {{ config.title }} on GitHub - we're fully open source!
          </h2>
        </div>

        <div v-if="session.$state.loggedIn" class="flex gap-2">
          <t-nuxt-link-button :to="{ name: 'user-handle', params: { handle: session.$state.userId } }" variant="primary">
            to my userpage
          </t-nuxt-link-button>

          <t-nuxt-link-button :to="{ name: 'me-preferences' }" variant="secondary">
            preferences
          </t-nuxt-link-button>
        </div>
        <div v-else class="flex gap-2">
          <t-nuxt-link-button :to="{ name: 'auth-login' }" variant="primary">
            Login
          </t-nuxt-link-button>

          <t-nuxt-link-button :to="{ name: 'auth-register' }" variant="secondary">
            Register
          </t-nuxt-link-button>
        </div>
      </div>
      <div class="hidden mascot lg:block">
        <img src="/mascot/riru.png" style="max-height:700px" alt="riru Mascot" m="l-auto">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppConfig } from '#app'
import { useSession } from '../store/session'
const session = useSession()
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
