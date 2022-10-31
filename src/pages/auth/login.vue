<script setup lang="ts">
import { navigateTo, useRoute, useRouter } from '#app'
import { reactive, ref } from 'vue'
import { useSession } from '~/store/session'

const session = useSession()
const route = useRoute()
const router = useRouter()

const error = undefined

const registerButton = ref<string>('Do not have an account?')

const login = reactive<{
  user?: string
  password?: string
}>({})

const userLogin = async () => {
  const result = await session.login(login.user, login.password)
  if (result) {
    const back = route.query.back === '1'
    if (back) {
      router.back()
    } else {
      navigateTo('/')
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-center px-4 py-12 my-auto sm:px-6 lg:px-8">
    <div class="relative w-full max-w-md p-6 overflow-hidden space-y-8 bg-kimberly-100/80 dark:bg-kimberly-800 rounded-3xl">
      <div>
        <h2 class="text-3xl text-center text-kimberly-800 dark:text-kimberly-50">
          Login
        </h2>
      </div>
      <form class="mt-8 space-y-12" autocomplete="off" @submit.prevent="userLogin">
        <div class="shadow-sm space-y-2">
          <div>
            <label for="user" class="sr-only">User / Email</label>
            <h1 v-if="error" class="auth-error-text">
              {{ error }}
            </h1>
            <input
              id="user"
              v-model="login.user"
              name="user"
              type="user"
              autocomplete="off"
              required
              class="w-full input input-ghost"
              :class="{ 'input-error': error }"
              placeholder="User"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <h1 v-if="error" class="auth-error-text">
              {{ error }}
            </h1>
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
        </div>

        <div class="grid grid-cols-2 gap-2">
          <nuxt-link to="/auth/register" class="btn btn-accent" @mouseenter="registerButton = 'sign up'" @mouseleave="registerButton = 'Do not have an account?'">
            {{ registerButton }}
          </nuxt-link>
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
  @apply text-red-500 text-sm font-medium mb-2
}
</style>
