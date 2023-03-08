<script setup lang="ts">
import { useSession } from '~/store/session'
const session = useSession()
const config = useAppConfig()
useHead({
  titleTemplate: `${config.title}`,
})
</script>

<template>
  <div class="flex items-center grow">
    <div class="container custom-container heading">
      <div class="content p-8">
        <div class="mb-6">
          <h1 class="mb-2 text-4xl font-bold text-center">
            {{ config.title }}
          </h1>
          <h2 class="font-semibold px-2 sm:px-0 h-sub text-md sm:text-left">
            We are an osu! private server built from the ground up with many
            unique features not seen elsewhere!<br>
            - for more information, check out gulag and guweb-next on GitHub
            <br>
            - we're fully open source!
          </h2>
        </div>
        <div class="grid grid-cols-2 gap-2 justify-center">
          <template v-if="session.$state.loggedIn">
            <t-nuxt-link-button
              :to="{
                name: 'user-handle',
                params: { handle: session.$state.userId },
              }"
              variant="primary"
            >
              to my profile
            </t-nuxt-link-button>
            <t-nuxt-link-button :to="{ name: 'me-settings' }" variant="secondary">
              settings
            </t-nuxt-link-button>
          </template>
          <template v-else>
            <t-nuxt-link-button :to="{ name: 'auth-login' }" variant="primary">
              Login
            </t-nuxt-link-button>
            <t-nuxt-link-button
              :to="{ name: 'auth-register' }"
              variant="secondary"
              class="btn-disabled"
            >
              Register
            </t-nuxt-link-button>
          </template>
        </div>
      </div>

      <div class="hidden mascot lg:block">
        <img
          src="/mascot/riru.png"
          style="max-height: 70vmin"
          alt="riru Mascot"
        >
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.h-sub {
  max-width: 32rem;
}
.heading {
  @apply relative flex items-center justify-between px-4 lg:px-0 mx-auto my-auto text-left w-max text-kimberly-900 dark:text-kimberly-100;
  &::before,
  &::after {
    content: "";
    @apply -z-10 opacity-50;
    @apply lg:absolute lg:top-[30%] lg:bottom-[30%] lg:left-0 lg:right-0;
    @apply lg:bg-gradient-to-r lg:from-kimberly-500/5 lg:to-transparent;
    @apply lg:rounded-3xl;
  }
  &::before {
    @apply lg:blur
  }
}
</style>
