<template>
  <div class="my-auto flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-kimberly-100/80 dark:bg-kimberly-800 p-6 rounded-3xl relative overflow-hidden">
      <div>
        <h2 class="text-center text-3xl text-kimberly-800 dark:text-kimberly-50">
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
              v-model="login.password"
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

<script>
export default {
  name: 'LoginPage',
  data () {
    return {
      login: {
        user: '',
        password: ''
      },
      fetching: false,
      error: null,
      registerButton: 'Do not have an account?'
    }
  },
  methods: {
    async userLogin () {
      // try {
      //   this.error = null
      //   this.fetching = true
      //   await this.$auth.loginWith('local', { data: this.login })
      //   this.$router.push('/')
      //   this.$toast.show({
      //     type: 'success',
      //     message: 'You have been logged in!'
      //   })
      // } catch (err) {
      //   const response = err.response
      //   if (response.data) {
      //     this.error = response.data.detail
      //   } else {
      //     this.error = response.statusText
      //   }
      // } finally {
      //   this.fetching = false
      // }
    }
  }
}
</script>

<style lang="postcss" scoped>
.auth-error-text {
  @apply text-red-500 text-sm font-medium mb-2
}
</style>
