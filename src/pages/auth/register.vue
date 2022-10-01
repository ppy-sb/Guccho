<template>
  <div class="my-auto flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-kimberly-100/80 dark:bg-kimberly-800 p-6 rounded-3xl relative overflow-hidden">
      <fetch-overlay :fetching="fetching" />

      <div>
        <h2 class="text-center text-3xl text-kimberly-800 dark:text-kimberly-50">
          Sign Up
        </h2>
      </div>
      <form class="mt-8 space-y-12" autocomplete="off" @submit.prevent="userRegisterAction">
        <div class="shadow-sm space-y-2">
          <div>
            <label for="user" class="sr-only">User / Email</label>
            <h1 v-if="error" class="auth-error-text">
              {{ error }}
            </h1>
            <input
              id="user"
              v-model="credential.user"
              name="user"
              type="user"
              autocomplete="off"
              required
              class="input input-ghost w-full"
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
              v-model="credential.password"
              name="password"
              type="password"
              autocomplete="off"
              required
              class="input input-ghost w-full"
              :class="{ 'input-error': error }"
              placeholder="Password"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button type="submit" class="btn btn-base-100">
            Sign Up
          </button>
          <nuxt-link :to="{name: 'auth-login'}" class="btn btn-neutral">
            Log in
          </nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import { userRegister } from '@/mock/index'
const credential = ref({
  user: '',
  password: ''
})
const error = ref('')
const fetching = ref(false)

const userRegisterAction = () => {
  fetching.value = true
  // const data = await userRegister()
}
</script>
<style lang="postcss" scoped>
.auth-error-text {
  @apply text-red-500 text-sm font-medium mb-2
}
</style>
