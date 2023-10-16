<script setup lang="ts">
import { CountryCode } from '~/def/country-code'
import type { UserCompact, UserOptional } from '~/def/user'
import { UserRole } from '~/def/user'

const { t, locale } = useI18n()


const search = ref<
    Partial<UserCompact<string>
    & Pick<UserOptional, 'email' | 'status'>
    & {
      registeredFrom: string
      registeredTo: string
      latestActivityFrom: string
      latestActivityTo: string
    }>
    & {
      page: number
      perPage: number
    }
  >({
    roles: [],
    page: 0,
    perPage: 10,
  })
const app = useNuxtApp()
const { data: users, refresh, pending } = await app.$client.admin.userManagement.search.useQuery(search)

function options<T extends Record<string, string>, TTr extends (key: keyof T, value: T[keyof T]) => string>(priv: T, translate: TTr = ((a: keyof T, b: T[keyof T]) => a) as TTr) {
  return Object.entries(priv).map(([label, value]) => ({ label: translate(label, value as T[keyof T]), value }) as { label: ReturnType<TTr>; value: T[keyof T] })
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="collapse collapse-arrow rounded-lg border border-base-300 bg-base-200">
      <input type="checkbox" class="peer">
      <div class="collapse-title text-md font-medium">
        <span class="align-middle">Search Parameters</span> <icon name="ion:search-outline" class="w-6 h-6 align-middle" />
      </div>
      <div class="collapse-content flex flex-col gap-2">
        <div class="sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2">
          <div class="form-control">
            <label class="label">
              <span class="label-text">User ID</span>
            </label>
            <input v-model="search.id" type="text" class="input input-sm" @input="() => { if (search.id === '') search.id = undefined }">
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Username</span>
            </label>
            <input v-model="search.name" type="text" class="input input-sm" @input="() => { if (search.name === '') search.name = undefined }">
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Link (Safe name)</span>
            </label>
            <input v-model="search.safeName" type="text" class="input input-sm" @input="() => { if (search.safeName === '') search.safeName = undefined }">
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input v-model="search.email" type="email" class="input input-sm" @input="() => { if (search.email === '') search.email = undefined }">
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Flag</span>
            </label>
            <div class="flex gap-2">
              <img :src="getFlagURL(search.flag)" class="w-6">
              <select v-model="search.flag" class="select w-full select-sm">
                <option v-for="countryCode in CountryCode" :key="countryCode" :disabled="countryCode === search.flag" :selected="countryCode === search.flag" :value="countryCode">
                  {{ toCountryName(countryCode) }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Roles</span>
            </label>
            <t-multi-select v-model="search.roles" size="sm" :options="options(UserRole, (_, value) => t(localeKey.role(value)))" />
          </div>
          <div class="form-control col-span-2 disbaled">
            <label class="label">
              <span class="label-text">Registered at</span>
            </label>
            <div class="join">
              <input v-model="search.registeredFrom" disabled type="datetime-local" class="join-item input input-sm w-full">
              <div class="join-item -bg-base-100">
                <span class="align-middle">~</span>
              </div>
              <input v-model="search.registeredTo" disabled type="datetime-local" class="input input-sm join-item w-full">
            </div>
          </div>
          <div class="form-control col-span-2">
            <label class="label">
              <span class="label-text">Last activity record</span>
            </label>
            <div class="join">
              <input v-model="search.latestActivityFrom" disabled type="datetime-local" class="join-item input input-sm w-full">
              <div class="join-item -bg-base-100">
                <span class="align-middle">~</span>
              </div>
              <input v-model="search.latestActivityTo" disabled type="datetime-local" class="input input-sm join-item w-full">
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="ml-auto" />
          <button class="btn btn-primary btn-sm" @click="() => refresh()">
            Search
            <icon name="ion:search-outline" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <div class="items-end sm:grid sm:grid-cols-2 md:grid-cols-3 gap-2">
      <!-- <div class="join">
        <div>
          <input class="input input-sm input-shadow join-item" placeholder="Filter">
        </div>
        <select class="select select-sm join-item">
          <option disabled selected>
            Type
          </option>
          <option>Contains</option>
          <option>Not</option>
          <option>Exact</option>
        </select>
        <div class="indicator">
          <span class="indicator-item badge badge-info">{{ users.length }}</span>
          <button class="btn btn-sm btn-secondary join-item">
            Filter
          </button>
        </div>
      </div> -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">Page</span>
        </label>
        <input v-model.number="search.page" type="number" min="0" max="20" step="1" class="input input-sm">
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Page size</span>
        </label>
        <input v-model.number="search.perPage" type="number" min="1" max="20" step="1" class="input input-sm" @input="() => { if (search.perPage === 0) search.perPage = 1 }">
      </div>
    </div>
    <div class="overflow-x-auto border border-base-300 rounded-lg">
      <table
        class="table" :class="{
          loading: pending,
        }"
      >
        <!-- head -->
        <thead>
          <tr>
            <!-- <th>
              <label>
                <input type="checkbox" class="checkbox">
              </label>
            </th> -->
            <th>User</th>
            <th>Roles</th>
            <th>Email</th>
            <th>Registered At</th>
            <th>Last Login</th>
            <!-- <th>Game Client</th> -->
            <!-- <th>IP</th> -->
            <th />
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="user in users" :key="user.id">
            <!-- <th>
              <label>
                <input type="checkbox" class="checkbox">
              </label>
            </th> -->
            <td>
              <div class="flex items-center space-x-3">
                <div class="avatar">
                  <div class="mask mask-squircle w-12 h-12">
                    <img :src="user.avatarSrc" alt="avatar">
                  </div>
                </div>
                <div>
                  <nuxt-link-locale class="font-bold whitespace-nowrap" :to="{ name: 'user-handle', params: { handle: `@${user.safeName}` } }">
                    {{ user.name }}
                  </nuxt-link-locale>
                  <div class="text-sm opacity-50 whitespace-nowrap">
                    {{ toCountryName(user.flag || CountryCode.Unknown) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="flex">
              <div class="f[[lex gap-1 flex-wrap">
                <span v-for="role in user.roles" :key="user.id + role" class="badge badge-sm whitespace-nowrap">{{ t(localeKey.role(role)) }}</span>
              </div>
            </td>
            <td><a class="link decoration-sky-500" :href="`mailto:${user.email}`">{{ user.email }}</a></td>
            <td><time class="whitespace-nowrap" :datetime="user.registeredAt.toString()">{{ user.registeredAt.toLocaleString(locale) }}</time></td>
            <td><time class="whitespace-nowrap" :datetime="user.lastActivityAt.toString()">{{ user.lastActivityAt.toLocaleString(locale) }}</time></td>
            <!-- <td>Osu Stable ()</td> -->
            <!-- <td>localhost</td> -->
            <th>
              <nuxt-link-locale
                :to="{
                  name: 'admin-users-id',
                  params: {
                    id: user.id,
                  },
                }" class="btn btn-ghost btn-xs"
              >
                Details
              </nuxt-link-locale>
            </th>
          </tr>
        </tbody>
        <!-- foot -->
        <!-- <tfoot>
          <tr>
            <th />
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
            <th />
          </tr>
        </tfoot> -->
      </table>
    </div>
  </div>
</template>

<style scoped>

</style>