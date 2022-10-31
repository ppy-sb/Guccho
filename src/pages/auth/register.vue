<template>
  <div class="flex items-center justify-center px-4 py-12 my-auto sm:px-6 lg:px-8">
    <div class="relative w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-8 bg-kimberly-150/30 dark:bg-kimberly-800 rounded-3xl">
      <fetch-overlay :fetching="fetching" />

      <div>
        <h2 class="text-3xl text-center text-kimberly-800 dark:text-kimberly-50">
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
              v-model="credential.password"
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
          <t-nuxt-link-button :to="{name: 'auth-login'}" variant="secondary">
            Log in
          </t-nuxt-link-button>
          <button type="submit" class="btn btn-primary">
            Sign Up
          </button>
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
