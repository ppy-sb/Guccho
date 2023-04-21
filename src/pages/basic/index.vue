<script setup lang="ts">
import { useSession } from '~/store/session'

const config = useAppConfig()
useHead({
  titleTemplate: `${config.title}`,
})
const session = useSession()

definePageMeta({
  layout: 'basic',
})
</script>

<template>
  <div class="basic custom-typography">
    <h1>welcome to {{ config.title }}</h1>
    <h4>
      We are an osu! private server built from the ground up with many unique
      features not seen elsewhere!<br>
      - for more information, check out gulag and Guccho on GitHub
      <br>
      - we're fully open source!
    </h4>
    <template v-if="session.$state.loggedIn">
      <nuxt-link
        :to="{
          name: 'user-handle',
          params: { handle: session.$state.userId },
        }"
      >
        to my profile
      </nuxt-link>
      <nuxt-link :to="{ name: 'me-settings' }">
        settings
      </nuxt-link>
    </template>
    <template v-else>
      <nuxt-link :to="{ name: 'auth-login' }">
        Login
      </nuxt-link>
      <br>
      <nuxt-link :to="{ name: 'auth-register' }">
        Register
      </nuxt-link>
    </template>
  </div>
</template>

<style lang="postcss">
.basic {
  @apply p-4;
  a {
    @apply text-blue-500 decoration-blue-500 decoration-2
  }
}
</style>
