<script setup lang="ts">
import type { TRPCError } from '@trpc/server'


import { useSession } from '~/store/session'

const session = useSession()
const route = useRoute()
const router = useRouter()
const config = useAppConfig()

if (session.loggedIn) {
  router.back()
}

useHead({
  titleTemplate: `Login - ${config.title}`,
})

const error = ref('')

const registerButton = ref<string>('Do not have an account?')

const login = reactive<{
  user: string
  password: string
}>({
  user: '',
  password: '',
})

const fetching = ref(false)

const userLogin = async () => {
  fetching.value = true
  error.value = ''
  try {
    const result = await session.login(login.user, login.password)
    if (result) {
      if (route.query.redirect) {
        await navigateTo(route.query.redirect.toString())
      }
      else if (route.query.back === '1') {
        router.back()
      }
      else {
        await navigateTo('/')
      }
    }
  }
  catch (_error) {
    error.value = (_error as TRPCError).message
  }
  finally {
    fetching.value = false
  }
}
</script>

<template>
  <div
    class="flex items-center justify-center px-4 py-12 my-auto sm:px-6 lg:px-8"
  >
    <div
      class="half-box"
    >
      <fetch-overlay :fetching="fetching" />
      <div>
        <h2
          class="text-3xl text-center text-kimberly-800 dark:text-kimberly-50"
        >
          Login
        </h2>
      </div>
      <form
        class="mt-8 space-y-12"
        autocomplete="off"
        @submit.prevent="userLogin"
      >
        <div class="flex flex-col gap-2">
          <div>
            <label for="user" class="sr-only">User / Email</label>
            <input
              id="user"
              v-model="login.user"
              name="user"
              type="user"
              autocomplete="off"
              required
              class="w-full input input-ghost shadow-sm"
              :class="{ 'input-error': error }"
              placeholder="User / ID / Email"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="login.password"
              name="password"
              type="password"
              autocomplete="off"
              required
              class="w-full input input-ghost shadow-sm"
              :class="{ 'input-error': error }"
              placeholder="Password"
            >
          </div>
          <h1 v-if="error" class="auth-error-text">
            {{ error }}
          </h1>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <t-nuxt-link-button
            to="/auth/register"
            variant="accent"
            class="btn-disabled"
            @mouseenter="registerButton = 'sign up'"
            @mouseleave="registerButton = 'Do not have an account?'"
          >
            {{ registerButton }}
          </t-nuxt-link-button>
          <button type="submit" class="btn btn-primary">
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.auth-error-text {
  @apply text-red-500 text-sm font-medium;
}

.half-box {
  @apply relative w-full max-w-md p-6 overflow-hidden space-y-8 rounded-3xl;
  &::before {
    content: "";
    @apply absolute left-0 top-0 right-0 bottom-0;
    @apply bg-gradient-to-t from-kimberly-500/5 to-transparent rounded-3xl;
    @apply blur-sm -z-10;
  }
}
</style>
