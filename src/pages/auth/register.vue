<script setup lang="ts">
import md5 from 'md5'
import type { TRPCClientError } from '@trpc/client'
import { Feature } from '~/def/features'
import type { AppRouter } from '~/server/trpc/routers'
import { useSession } from '~/store/session'
import { features } from '$active'

interface Shape {
  name: string
  safeName?: string
  email: string
  password: string
}
const shape: Shape = {
  name: '',
  email: '',
  password: '',
}

const app = useNuxtApp()
const { t } = useI18n()
const loginButton = shallowRef(t('have-account'))

const reg = shallowReactive({ ...shape })
const error = shallowReactive({ ...shape })
const unknownError = ref<Error>()
const fetching = shallowRef(false)

function unique(key: keyof Shape) {
  return async () => {
    if (!reg[key]) {
      error[key] = t('key-required', { key })
      return false
    }
    const exists = await app.$client.user.exists.query({ handle: reg[key] as string })
    if (!exists) {
      return true
    }
    error[key] = t('key-taken', { key })
    return false
  }
}
const pwPatternStr = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
const pwPattern = new RegExp(pwPatternStr)

const safeNamePatternStr = '[a-z0-9][a-z0-9_]+[a-z0-9]'
const safeNamePattern = new RegExp(safeNamePatternStr)

const validate: {
  [Key in keyof Shape]: () => boolean | Promise<boolean>
} = {
  name: unique('name'),
  safeName: async () => features.has(Feature.StableUsername) ? !!reg.safeName?.match(safeNamePattern) && await unique('safeName')() : true,
  email: unique('email'),
  password() {
    return !!reg.password.match(pwPattern)
  },
}

useHead({
  title: () => `${app.$i18n.t('global.register')} - ${app.$i18n.t('server.name')}`,
})

async function userRegisterAction() {
  fetching.value = true
  const result = (await Promise.all(Object.values(validate).map(test => test()))).every(Boolean)
  if (!result) {
    fetching.value = false
    return
  }

  type E = TRPCClientError<AppRouter['user']['register']>

  const result$ = await app.$client.user.register.mutate({
    name: reg.name,
    safeName: reg.safeName,
    email: reg.email,
    passwordMd5: md5(reg.password),
  })
    .catch((ex: E) => {
      const e = ex.data?.zodError?.fieldErrors
      if (e) {
        for (const f in e) {
          switch (f) {
            case 'name': {
              error.name = e[f]?.join(', ') || ''
              break
            }
            case 'email': {
              error.email = e[f]?.join(', ') || ''
              break
            }
            case 'passwordMd5': {
              error.password = e[f]?.join(', ') || ''
              break
            }
          }
        }
      }
      else {
        unknownError.value = ex
      }
    })
  fetching.value = false
  if (result$) {
    const session = useSession()
    await session.retrieve()
    navigateTo('/article/registered')
  }
}
</script>

<i18n lang="yaml">
en-GB:
  have-account: Have account?
  key-required: '{key} must not be empty'
  key-taken: '{key} is already taken.'
  name: Nickname (you can change it later)
  name-pattern: Must not includes uppercase letter, nor starts or ends with _, contains only number, a-z and _
  link: Username (semi-permanent)
  email: Email
  password: Password
  password-pattern: Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters

zh-CN:
  have-account: 已经有一个账号了?
  key-required: '{key} 不能为空'
  key-taken: '{key} 已经被占用了'
  name: 用户昵称(可以随时修改)
  name-pattern: 不包含大写字母,不能以 _ 作为开头和结尾,即只能包含 数字、小写字母a-z 以及 下划线 _
  link: 用户名 (几乎不可修改)
  email: 电子邮箱
  password: 密码
  password-pattern: 必须包含至少一个数字、一个大写字母和一个小写字母,并且密码长度至少为8。

fr-FR:
  have-account: Vous avez déjà un compte?
  key-required: '{key} ne peut pas être vide.'
  key-taken: '{key} n''est pas disponible.'
  name: Pseudo (vous pourrez le changer plus tard)
  name-pattern: Ne doit pas contenir de lettre majuscule, ni commencer ou se terminer par _, doit contenir uniquement des chiffres, a-z et _
  link: Nom d'utilisateur (semi-permanent)
  email: Email
  password: Mot de passe
  password-pattern: Doit contenir au moins un chiffre et une lettre majuscule et minuscule, et au moins 8 caractères.
</i18n>

<template>
  <div
    class="w-full flex flex-col"
  >
    <div
      class="mx-auto half-box"
    >
      <fetch-overlay :fetching="fetching" />

      <div>
        <h2
          class="text-2xl pl-3 text-gbase-800 dark:text-gbase-50"
        >
          {{ $t('global.register') }}
        </h2>
      </div>
      <form
        class="mt-8 space-y-12"
        autocomplete="off"
        @submit.prevent="userRegisterAction"
      >
        <div v-if="unknownError" class="text-error ">
          {{ unknownError.message }}
        </div>
        <div class="space-y-2">
          <div>
            <label for="name" class="sr-only">{{ t('name') }}</label>
            <input
              id="nickname"
              v-model="reg.name"
              name="nickname"
              type="name"
              autocomplete="off"
              required
              class="w-full input input-shadow input-ghost shadow-sm"
              :class="{ 'input-error': error.name }"
              :placeholder="t('name')"
              @input="error.name = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.name }}
            </div>
          </div>
          <template v-if="features.has(Feature.StableUsername)">
            <div>
              <label for="name" class="sr-only">{{ t('link') }}</label>
              <input
                id="name"
                v-model="reg.safeName"
                name="name"
                type="name"
                autocomplete="off"
                required
                :pattern="safeNamePatternStr"
                :title="t('name-pattern')"
                class="w-full input input-shadow input-ghost shadow-sm"
                :class="{ 'input-error': error.safeName }"
                :placeholder="t('link')"
                @input="error.safeName = ''"
              >
              <div class="text-error text-sm pl-4">
                {{ error.safeName }}
              </div>
            </div>
          </template>
          <div>
            <label for="name" class="sr-only">{{ t('email') }}</label>
            <input
              id="email"
              v-model="reg.email"
              name="email"
              type="email"
              autocomplete="off"
              required
              class="w-full input input-shadow input-ghost shadow-sm"
              :class="{ 'input-error': error.email }"
              :placeholder="t('email')"
              @input="error.email = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.email }}
            </div>
          </div>
          <div>
            <label for="password" class="sr-only">{{ t('password') }}</label>
            <input
              id="password"
              v-model="reg.password"
              name="password"
              type="password"
              autocomplete="off"
              required
              :pattern="pwPatternStr"
              :title="t('password-pattern')"
              class="w-full input input-shadow input-ghost shadow-sm"
              :class="{ 'input-error': error.password }"
              :placeholder="t('password')"
              @input="error.password = ''"
            >
            <div class="text-error text-sm pl-4">
              {{ error.password }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <t-nuxt-link-button
            class="btn-shadow"
            :to="{ name: 'auth-login' }"
            variant="secondary"
            @mouseenter="loginButton = $t('global.login')"
            @mouseleave="loginButton = t('have-account')"
          >
            {{ loginButton }}
          </t-nuxt-link-button>
          <button type="submit" class="btn btn-shadow btn-primary">
            {{ $t('global.register') }}
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
  @apply relative w-full max-w-md p-6;
  /* &::before {
    content: "";
    @apply absolute left-0 top-0 right-0 bottom-0;
    @apply bg-gradient-to-t from-gbase-500/5 to-transparent rounded-3xl;
    @apply blur-sm -z-10;
  } */
}
</style>
