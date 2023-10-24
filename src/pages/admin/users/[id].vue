<script setup lang="ts">
import { CountryCode } from '~/def/country-code'
import { UserRole } from '~/def/user'

const app = useNuxtApp()
const { t } = useI18n()
const route = useRoute('admin-users-id')
const {
  data: detail,
} = await app.$client.admin.userManagement.detail.useQuery(route.params.id)

function options<T extends Record<string, string>, TTr extends (key: keyof T, value: T[keyof T]) => string>(priv: T, translate: TTr = ((a: keyof T, b: T[keyof T]) => a) as TTr) {
  return Object.entries(priv).map(([label, value]) => ({ label: translate(label, value as T[keyof T]), value }) as { label: ReturnType<TTr>; value: T[keyof T] })
}
</script>

<template>
  <div class="sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
    <div class="form-control">
      <label class="label">
        <span class="label-text">ID</span>
      </label>
      <input v-model="detail.id" type="text" class="input input-sm">
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Stable Client ID</span>
      </label>
      <input v-model="detail.stableClientId" disabled type="text" class="input input-sm">
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Name</span>
      </label>
      <input v-model="detail.name" type="text" class="input input-sm">
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Link (Safe name)</span>
      </label>
      <input v-model="detail.safeName" type="text" class="input input-sm">
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input v-model="detail.email" type="text" class="input input-sm">
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Flag</span>
      </label>
      <div class="flex gap-2">
        <img :src="getFlagURL(detail.flag)" class="w-6">
        <select v-model="detail.flag" class="select w-full select-sm">
          <option v-for="countryCode in CountryCode" :key="countryCode" :disabled="countryCode === detail.flag" :selected="countryCode === detail.flag" :value="countryCode">
            {{ toCountryName(countryCode) }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Roles</span>
      </label>
      <t-multi-select v-model="detail.roles" size="sm" :options="options(UserRole, (_, value) => t(localeKey.role(value)))" />
    </div>
  </div>
</template>
