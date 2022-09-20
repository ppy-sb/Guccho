<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-ebony-clay-900 p-6 rounded-lg relative overflow-hidden">
      <fetch-overlay :fetching="fetching" />

      <div>
        <h2 class="text-center text-3xl text-ebony-clay-200">
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
              class="auth-input"
              :class="{ 'auth-error-input': error }"
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
              class="auth-input"
              :class="{ 'auth-error-input': error }"
              placeholder="Password"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button type="submit" class="auth-button">
            Sign Up
          </button>
          <nuxt-link :to="{name: 'auth-login'}" class="auth-button">
            Log in
          </nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
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
.auth-input {
  @apply appearance-none rounded-md bg-ebony-clay-900 relative block w-full px-3 py-4 placeholder-white placeholder-opacity-25 text-ebony-clay-200 font-semibold rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
}

.auth-button {
  @apply relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-mulberry-800 hover:bg-mulberry-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mulberry-700
}

.auth-error-text {
  @apply text-red-500 text-sm font-medium mb-2
}

.auth-error-input {
  @apply border-red-500 bg-red-500 bg-opacity-20 border-opacity-30
}

</style>
