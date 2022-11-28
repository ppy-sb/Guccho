<script setup lang="ts">
import type { TRPCError } from '@trpc/server'
import { reactive, ref } from 'vue'
import { navigateTo, useRoute, useRouter } from '#app'
import { useSession } from '~/store/session'

const session = useSession()
const route = useRoute()
const router = useRouter()

if (session.loggedIn)
  router.back()

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
      const back = route.query.back === '1'
      if (back)
        router.back()
      else await navigateTo('/')
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
  <div class="flex items-center justify-center px-4 py-12 my-auto sm:px-6 lg:px-8">
    <div class="relative w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-8 bg-kimberly-100/80 dark:bg-kimberly-800 rounded-3xl">
      <fetch-overlay :fetching="fetching" />
      <div>
        <h2 class="text-3xl text-center text-kimberly-800 dark:text-kimberly-50">
          Login
        </h2>
      </div>
      <form
        class="mt-8 space-y-12"
        autocomplete="off"
        @submit.prevent="userLogin"
      >
        <div class="shadow-sm flex flex-col gap-2">
          <div>
            <label
              for="user"
              class="sr-only"
            >User / Email</label>
            <input
              id="user"
              v-model="login.user"
              name="user"
              type="user"
              autocomplete="off"
              required
              class="w-full input input-ghost"
              :class="{ 'input-error': error }"
              placeholder="User / ID / Email"
            >
          </div>
          <div>
            <label
              for="password"
              class="sr-only"
            >Password</label>
            <input
              id="password"
              v-model="login.password"
              name="password"
              type="password"
              autocomplete="off"
              required
              class="w-full input input-ghost"
              :class="{ 'input-error': error }"
              placeholder="Password"
            >
          </div>
          <h1
            v-if="error"
            class="auth-error-text"
          >
            {{ error }}
          </h1>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <t-nuxt-link-button
            to="/auth/register"
            variant="accent"
            @mouseenter="registerButton = 'sign up'"
            @mouseleave="registerButton = 'Do not have an account?'"
          >
            {{ registerButton }}
          </t-nuxt-link-button>
          <button
            type="submit"
            class="btn btn-primary"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.auth-error-text {
  @apply text-red-500 text-sm font-medium
}
</style>
