<script setup lang="ts">
import type { TRPCError } from '@trpc/server'
import { useSession } from '~/store/session'

const session = useSession()
const router = useRouter()
if (session.loggedIn) {
  router.back()
}

const route = useRoute()
const app = useNuxtApp()
const { t } = useI18n()

useHead({
  title: () => `${app.$i18n.t('global.login')} - ${app.$i18n.t('server.name')}`,
})

const error = shallowRef('')

const registerButton = shallowRef<string>(t('have-no-account'))

const login = shallowReactive<{
  user: string
  password: string
}>({
  user: '',
  password: '',
})

const fetching = shallowRef(false)

async function userLogin() {
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

<i18n lang="yaml">
en-GB:
  have-no-account: Don't have an account?
  user-or-email: User / Email
  user-id-email: User / ID / Email
  password: Password

zh-CN:
  have-no-account: 没有账号?
  user-or-email: 用户名 或者 邮箱地址
  user-id-email: 用户名 或者 用户ID 或者 邮箱地址
  password: 密码

fr-FR:
  have-no-account: Vous n'avez pas de compte?
  user-or-email: Utilisateur / Email
  user-id-email: Utilisateur / ID / Email
  password: Mot de passe
</i18n>

<template>
  <div class="flex flex-col w-full">
    <div class="mx-auto half-box">
      <fetch-overlay :fetching="fetching" />
      <div>
        <h2 class="pl-2 text-2xl text-gbase-800 dark:text-gbase-50">
          {{ $t('global.login') }}
        </h2>
      </div>
      <form class="mt-8 space-y-12" autocomplete="off" method="post" @submit.prevent="userLogin">
        <div class="flex flex-col gap-2">
          <div>
            <label for="user" class="sr-only">{{ t('user-or-email') }}</label>
            <input
              id="user" v-model="login.user" name="user" type="user" autocomplete="off" required
              class="w-full shadow-sm input input-shadow input-ghost" :class="{ 'input-error': error }"
              :placeholder="t('user-id-email')"
            >
          </div>
          <div>
            <label for="password" class="sr-only">{{ t('password') }}</label>
            <input
              id="password" v-model="login.password" name="password" type="password" autocomplete="off" required
              class="w-full shadow-sm input input-shadow input-ghost" :class="{ 'input-error': error }"
              :placeholder="t('password')"
            >
          </div>
          <h1 v-if="error" class="auth-error-text">
            {{ error }}
          </h1>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <t-nuxt-link-button
            class="btn-shadow" to="/auth/register" variant="accent"
            @mouseenter="registerButton = $t('global.register')" @mouseleave="registerButton = t('have-no-account')"
          >
            {{ registerButton }}
          </t-nuxt-link-button>
          <button type="submit" class="btn btn-shadow btn-primary">
            {{ $t('global.login') }}
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
  /* &::before {
    content: "";
    @apply absolute left-0 top-0 right-0 bottom-0;
    @apply bg-gradient-to-t from-gbase-500/5 to-transparent rounded-3xl;
    @apply blur-sm -z-10;
  } */
}
</style>
