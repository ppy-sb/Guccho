<script setup lang="ts">
import md5 from 'md5'
import type { Awaitable } from '~/types/common'
import { useSession } from '~/store/session'

const loginButton = shallowRef('Have account?')
const shape = {
  name: '',
  safeName: '',
  email: '',
  password: '',
}
const reg = shallowReactive({ ...shape })
const error = shallowReactive({ ...shape })
// const serverError = shallowRef('')
const fetching = shallowRef(false)
const config = useAppConfig()
const app$ = useNuxtApp()

function unique(key: keyof typeof shape) {
  return async () => {
    if (!reg[key]) {
      error[key] = `${key} must not be empty`
      return false
    }
    const exists = await app$.$client.user.exists.query({ handle: reg[key] })
    if (!exists) {
      return true
    }
    error[key] = `${key} is already taken.`
    return false
  }
}
const pwPatternStr = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
const pwPattern = new RegExp(pwPatternStr)
const safeNamePatternStr = '[a-z0-9][a-z0-9_]+[a-z0-9]'
const safeNamePattern = new RegExp(safeNamePatternStr)
const validate: {
  [Key in keyof typeof shape]: () => Awaitable<boolean>
} = {
  name: unique('name'),
  safeName: async () => Boolean(reg.safeName.match(safeNamePattern)) && await unique('safeName')(),
  email: unique('email'),
  password() {
    return Boolean(reg.password.match(pwPattern))
  },
}

useHead({
  titleTemplate: `Register - ${config.title}`,
})
// function isValidationError(
//   cause: any,
// ): cause is TRPCClientError<AppRouter> {
//   return cause.name === 'TRPCClientError'
// }
async function userRegisterAction() {
  fetching.value = true
  const result = (await Promise.all(Object.values(validate).map(test => test()))).every(Boolean)
  if (!result) {
    fetching.value = false
    return
  }

  const result$ = await app$.$client.user.register.mutate({
    name: reg.name,
    safeName: reg.safeName,
    email: reg.email,
    passwordMd5: md5(reg.password),
  })
    .catch((ex: unknown) => {
      if ((ex as any).cause.data.error.json.name === 'ZodError') {
        const e = (ex as any).cause.data.error.json.issues as { validation: 'email' | 'passwordMd5'; message: string }[]
        for (const f of e) {
          switch (f.validation) {
            case 'email': {
              error.email = f.message
              break
            }
            case 'passwordMd5': {
              error.password = f.message
              break
            }
          }
        }
      }

      // serverError.value = (ex as Error).message
    })
  fetching.value = false
  if (result$) {
    const session = useSession()
    await session.retrieve()
    navigateTo('/article/registered')
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
          class="text-3xl text-center text-gbase-800 dark:text-gbase-50"
        >
          Sign Up
        </h2>
      </div>
      <form
        class="mt-8 space-y-12"
        autocomplete="off"
        @submit.prevent="userRegisterAction"
      >
        <!-- <div class="text-error text-sm pl-4">
          {{ serverError }}
        </div> -->
        <div class="space-y-2">
          <div>
            <label for="name" class="sr-only">name</label>
            <input
              id="nickname"
              v-model="reg.name"
              name="nickname"
              type="name"
              autocomplete="off"
              required
              class="w-full input input-ghost shadow-sm"
              :class="{ 'input-error': error.name }"
              placeholder="Nickname (you can change it later)"
              @input="error.name = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.name }}
            </div>
          </div>
          <div>
            <label for="name" class="sr-only">username</label>
            <input
              id="name"
              v-model="reg.safeName"
              name="name"
              type="name"
              autocomplete="off"
              required
              :pattern="safeNamePatternStr"
              title="Must not includes uppercase letter, nor starts or ends with _, contains only number, a-z and _"
              class="w-full input input-ghost shadow-sm"
              :class="{ 'input-error': error.safeName }"
              placeholder="Username (semi-permanent)"
              @input="error.safeName = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.safeName }}
            </div>
          </div>
          <div>
            <label for="name" class="sr-only">email</label>
            <input
              id="email"
              v-model="reg.email"
              name="email"
              type="email"
              autocomplete="off"
              required
              class="w-full input input-ghost shadow-sm"
              :class="{ 'input-error': error.email }"
              placeholder="Email"
              @input="error.email = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.email }}
            </div>
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="reg.password"
              name="password"
              type="password"
              autocomplete="off"
              required
              :pattern="pwPatternStr"
              title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
              class="w-full input input-ghost shadow-sm"
              :class="{ 'input-error': error.password }"
              placeholder="Password"
              @input="error.password = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.password }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <t-nuxt-link-button
            :to="{ name: 'auth-login' }"
            variant="secondary"
            @mouseenter="loginButton = 'Login'"
            @mouseleave="loginButton = 'Have account?'"
          >
            {{ loginButton }}
          </t-nuxt-link-button>
          <button type="submit" class="btn btn-primary">
            Sign Up
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
    @apply bg-gradient-to-t from-gbase-500/5 to-transparent rounded-3xl;
    @apply blur-sm -z-10;
  }
}
</style>
