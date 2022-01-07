<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-hsl-b5 p-6 rounded-lg relative overflow-hidden">
      <FetchOverlay :fetching="fetching" />

      <div>
        <h2 class="text-center text-3xl text-gray-200">
          Login
        </h2>
      </div>
      <form class="mt-8 space-y-12" @submit.prevent="userLogin" autocomplete="off">
        <div class="shadow-sm space-y-2">
          <div>
            <label for="user" class="sr-only">Username</label>
            <h1 v-if="error" class="auth-error-text">
              {{ error }}
            </h1>
            <input
              id="user"
              v-model="login.username"
              name="user"
              type="user"
              autocomplete="off"
              required
              class="auth-input"
              :class="{ 'auth-error-input': error }"
              placeholder="Username"
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
              class="auth-input"
              :class="{ 'auth-error-input': error }"
              placeholder="Password"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button type="submit" class="auth-button">
            Sign in
          </button>
          <nuxt-link to="/auth/register" class="auth-button">
            Sign up
          </nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data () {
    return {
      login: {
        username: '',
        password: ''
      },
      fetching: false,
      error: null
    }
  },
  methods: {
    async userLogin () {
      try {
        this.error = null
        this.fetching = true
        await this.$auth.loginWith('local', { data: this.login })
        this.$router.push('/')
        this.$toast.show({
          type: 'success',
          message: 'You have been logged in!'
        })
      } catch (err) {
        const response = err.response
        if (response.data) {
          this.error = response.data.detail
        } else {
          this.error = response.statusText
        }
      } finally {
        this.fetching = false
      }
    }
  }
}
</script>

<style>
.auth-input {
  @apply appearance-none rounded-md bg-hsl-b6 relative block w-full px-3 py-4 placeholder-white placeholder-opacity-25 text-gray-200 font-semibold rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
}

.auth-button {
  @apply group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hsl-h2 hover:bg-hsl-h3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hsl-h1
}

.auth-error-text {
  @apply text-red-500 text-sm font-medium mb-2
}

.auth-error-input {
  @apply border-red-500 bg-red-500 bg-opacity-20 border-3 border-opacity-30
}

</style>
