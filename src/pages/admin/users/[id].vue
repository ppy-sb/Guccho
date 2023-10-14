<script setup lang="ts">
import { CountryCode } from '~/def/country-code'


const app = useNuxtApp()
const route = useRoute('admin-users-id')
const {
  data:detail,
} = await app.$client.admin.userManagement.detail.useQuery(route.params.id)
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
  </div>
</template>
