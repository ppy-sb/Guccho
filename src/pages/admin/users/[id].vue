<script setup lang="ts">
import { CountryCode } from '~/def/country-code'
import { UserRole } from '~/def/user'

const app = useNuxtApp()
const { t } = useI18n()
const route = useRoute('admin-users-id')

const detail = ref(await app.$client.admin.userManagement.detail.query(route.params.id))
const error = ref<Error>()
// eslint-disable-next-line antfu/no-const-enum
const enum Status {
  Idle,
  Pending,
  Succeed,
  Errored,
}
const icon = {
  [Status.Idle]: 'ic:round-save',
  [Status.Succeed]: 'line-md:confirm',
  [Status.Errored]: 'line-md:cancel',
} as const
const status = ref(Status.Idle)

async function save() {
  error.value = undefined
  status.value = Status.Pending
  try {
    const newValue = await app.$client.admin.userManagement.saveDetail.mutate([route.params.id, detail.value])
    status.value = Status.Succeed
    detail.value = newValue
  }
  catch (e) {
    status.value = Status.Errored
    if (e instanceof Error) {
      error.value = e
    }
  }
}

function options<T extends Record<string, string>, TTr extends (key: keyof T, value: T[keyof T]) => string>(priv: T, translate: TTr = ((a: keyof T, b: T[keyof T]) => a) as TTr) {
  return Object.entries(priv).map(([label, value]) => ({ label: translate(label, value as T[keyof T]), value }) as { label: ReturnType<TTr>; value: T[keyof T] })
}
</script>

<i18n lang="yaml">
en-GB:
  id: ID
  stable-client-id: Stable Client ID
  name: Name
  link-name: Link (Safe name)
  email: Email
  flag: Flag
  roles: Roles
  save-btn: Save
zh-CN:
  id: ID
  stable-client-id: Stable Client ID
  name: 名称
  link-name: 引用名称
  email: 邮箱
  flag: 国家/地区
  roles: 角色
  save-btn: 保存
fr-FR:
  id: ID
  stable-client-id: Stable Client ID
  name: Name
  link-name: Link (Safe name)
  email: Email
  flag: Flag
  roles: Roles
  save-btn: Save
</i18n>

<template>
  <div v-if="detail" class="container custom-container">
    <div v-if="error" class="alert alert-error ">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{{ error.message }}</span>
    </div>
    <dl>
      <div class="striped">
        <dt class="striped-dt">
          {{ t('id') }}
        </dt>
        <dd class="striped-text flex gap-1 items-center">
          <input v-model="detail.id" type="text" class="input input-sm w-full">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('stable-client-id') }}
        </dt>
        <dd class="striped-text flex gap-1 items-center">
          <input v-model="detail.stableClientId" disabled type="text" class="input input-sm w-full">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('name') }}
        </dt>
        <dd class="striped-text flex gap-1 items-center">
          <input v-model="detail.name" type="text" class="input input-sm w-full">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('link-name') }}
        </dt>
        <dd class="striped-text flex gap-1 items-center">
          <input v-model="detail.safeName" type="text" class="input input-sm w-full">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('email') }}
        </dt>
        <dd class="striped-text flex gap-1 items-center">
          <input v-model="detail.email" type="text" class="input input-sm w-full">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('flag') }}
        </dt>
        <dd class="striped-text flex gap-2 items-center">
          <img :src="getFlagURL(detail.flag)" class="w-6">
          <select v-model="detail.flag" class="select w-full select-sm">
            <option v-for="countryCode in CountryCode" :key="countryCode" :disabled="countryCode === detail.flag" :selected="countryCode === detail.flag" :value="countryCode">
              {{ toCountryName(countryCode) }}
            </option>
          </select>
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('roles') }}
        </dt>
        <dd class="striped-text flex gap-1 items-center">
          <t-multi-select v-model="detail.roles" class="w-full" size="sm" :options="options(UserRole, (_, value) => t(localeKey.role(value)))" />
        </dd>
      </div>
    </dl>
    <button
      class="btn btn-shadow" :class="{
        'loading': status === Status.Pending,
        'btn-success': status === Status.Succeed,
        'btn-error': status === Status.Errored,
      }" @click="save"
    >
      {{ t('save-btn') }}
      <Icon v-if="status !== Status.Pending" :name="icon[status]" class="w-5 h-5" />
    </button>
  </div>
</template>

<style lang="postcss">
.striped {
  @apply px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6;
  &:nth-child(odd){
    @apply bg-gbase-50 dark:bg-gbase-800
  }
}
.striped-dt {
  @apply text-sm font-medium text-gbase-500;
}
.striped-text {
  @apply mt-1 text-sm text-gbase-900 dark:text-gbase-100 sm:col-span-2 sm:mt-0;
}
</style>
