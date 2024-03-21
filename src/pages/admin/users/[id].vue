<script setup lang="ts">
import md5 from 'md5'
import { CountryCode } from '~/def/country-code'
import { roles as options } from '~/common/options'

const app = useNuxtApp()
const { t } = useI18n()
const route = useRoute('admin-users-id')

const error = ref<Error>()
const f = await app.$client.admin.userManagement.detail.query(route.params.id)
const detail = ref(f as typeof f & { password?: string })
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
    const send = { ...detail.value, password: detail.value.password ? md5(detail.value.password) : undefined }
    const newValue = await app.$client.admin.userManagement.saveDetail.mutate([route.params.id, send])
    status.value = Status.Succeed
    detail.value = { ...newValue }
  }
  catch (e) {
    status.value = Status.Errored
    if (e instanceof Error) {
      error.value = e
    }
  }
}
</script>

<i18n lang="yaml">
en-GB:
  id: ID
  stable-client-id: Stable Client ID
  name: Name
  link-name: Link (Safe name)
  password: Password
  email: Email
  flag: Flag
  roles: Roles
  save-btn: Save
zh-CN:
  id: ID
  stable-client-id: Stable Client ID
  name: 名称
  link-name: 引用名称
  password: 密码
  email: 邮箱
  flag: 国家或地区
  roles: 角色
  save-btn: 保存
fr-FR:
  id: Identifiant
  stable-client-id: Identifiant Stable Client
  name: Nom
  link-name: Lien (Nom sécurisé)
  password: Mot de passe
  email: Email
  flag: Drapeau
  roles: Rôles
  save-btn: Enregistrer
</i18n>

<template>
  <div v-if="detail" class="container custom-container">
    <div v-if="error" class="overflow-x-auto text-left alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <pre>{{ formatGucchoError(error) }}</pre>
    </div>
    <dl>
      <div class="striped">
        <dt class="striped-dt">
          {{ t('id') }}
        </dt>
        <dd class="striped-text">
          <input v-model="detail.id" type="text" class="w-full input input-sm">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('stable-client-id') }}
        </dt>
        <dd class="striped-text">
          <input v-model="detail.stableClientId" disabled type="text" class="w-full input input-sm">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('name') }}
        </dt>
        <dd class="striped-text">
          <input v-model="detail.name" type="text" class="w-full input input-sm">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('link-name') }}
        </dt>
        <dd class="striped-text">
          <input v-model="detail.safeName" type="text" class="w-full input input-sm">
        </dd>
      </div>
      <div class="striped">
        <dt class="striped-dt">
          {{ t('password') }}
        </dt>
        <dd class="striped-text">
          <input v-model="detail.password" type="text" class="w-full input input-sm">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('email') }}
        </dt>
        <dd class="striped-text">
          <input v-model="detail.email" type="text" class="w-full input input-sm">
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('flag') }}
        </dt>
        <dd class="flex items-bottom gap-2 striped-text">
          <img :alt="detail.flag" :src="getFlagURL(detail.flag)" class="w-6">
          <select v-model="detail.flag" class="w-full select select-sm">
            <option
              v-for="countryCode in CountryCode"
              :key="countryCode"
              :disabled="countryCode === detail.flag"
              :selected="countryCode === detail.flag"
              :value="countryCode"
            >
              <template v-if="countryCode === CountryCode.Unknown">
                ❓
              </template>
              <template v-else-if="countryCode === detail.flag">
                ➖
              </template>
              <template v-else>
                {{ getFlagEmoji(countryCode) }}
              </template>
              {{ $t(localeKey.country(countryCode)) }}
            </option>
          </select>
        </dd>
      </div>

      <div class="striped">
        <dt class="striped-dt">
          {{ t('roles') }}
        </dt>
        <dd class="striped-text">
          <t-multi-select v-model="detail.roles" class="w-full" size="sm" :options="options($t)" />
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
