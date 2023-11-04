<script setup lang="ts">
import { CountryCode } from '~/def/country-code'
import { type UserCompact, type UserOptional, UserRole } from '~/def/user'

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

<i18n lang="yaml">
en-GB:
  user: User
  search-parameters: Search Parameters
  page: page
  page-size: Page size
  user-id: User ID
  username: Username
  link-name: Link (Safe name)
  email: Email
  flag: Flag
  roles: Roles
  registered-at: Registered at
  last-activity: Last activity record
  search-btn: Search
zh-CN:
  user: 用户
  search-parameters: 高级搜索
  page: 页数
  page-size: 单页显示个数
  user-id: 用户 ID
  username: 用户名
  link-name: 引用名称
  email: 游戏
  flag: 国家或地区
  roles: 角色
  registered-at: 注册于
  last-activity: 上次活跃于
  details: 详情
  search-btn: 搜索
fr-FR:
  user: User
  search-parameters: Search Parameters
  page: page
  page-size: Page size
  user-id: User ID
  username: Username
  link-name: Link (Safe name)
  email: Email
  flag: Flag
  roles: Roles
  registered-at: Registered at
  last-activity: Last activity record
  search-btn: Search
</i18n>

<template>
  <div class="flex flex-col gap-2">
    <div class="border rounded-lg collapse collapse-arrow border-base-300 bg-base-200">
      <input type="checkbox" class="peer">
      <div class="font-medium collapse-title text-md">
        <span class="align-middle">{{ t('search-parameters') }}</span>
        <icon name="ion:search-outline" class="w-6 h-6 align-middle" />
      </div>
      <div class="flex flex-col gap-2 collapse-content">
        <div class="gap-2 sm:grid sm:grid-cols-2 md:grid-cols-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('user-id') }}</span>
            </label>
            <input
              v-model="search.id" type="text" class="input input-sm"
              @input="() => { if (search.id === '') search.id = undefined }"
            >
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('username') }}</span>
            </label>
            <input
              v-model="search.name" type="text" class="input input-sm"
              @input="() => { if (search.name === '') search.name = undefined }"
            >
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('link-name') }}</span>
            </label>
            <input
              v-model="search.safeName" type="text" class="input input-sm"
              @input="() => { if (search.safeName === '') search.safeName = undefined }"
            >
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('email') }}</span>
            </label>
            <input
              v-model="search.email" type="email" class="input input-sm"
              @input="() => { if (search.email === '') search.email = undefined }"
            >
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('flag') }}</span>
            </label>
            <div class="flex gap-2">
              <img :src="getFlagURL(search.flag)" class="w-6">
              <select v-model="search.flag" class="w-full select select-sm">
                <option
                  v-for="countryCode in CountryCode" :key="countryCode" :disabled="countryCode === search.flag"
                  :selected="countryCode === search.flag" :value="countryCode"
                >
                  {{ t(localeKey.country(countryCode)) }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ t('roles') }}</span>
            </label>
            <t-multi-select
              v-model="search.roles" size="sm"
              :options="options(UserRole, (_, value) => t(localeKey.role(value)))"
            />
          </div>
          <div class="col-span-2 form-control disbaled">
            <label class="label">
              <span class="label-text">{{ t('registered-at') }}</span>
            </label>
            <div class="join">
              <input
                v-model="search.registeredFrom" disabled type="datetime-local"
                class="w-full join-item input input-sm"
              >
              <div class="join-item -bg-base-100">
                <span class="align-middle">~</span>
              </div>
              <input v-model="search.registeredTo" disabled type="datetime-local" class="w-full input input-sm join-item">
            </div>
          </div>
          <div class="col-span-2 form-control">
            <label class="label">
              <span class="label-text">{{ t('last-activity') }}</span>
            </label>
            <div class="join">
              <input
                v-model="search.latestActivityFrom" disabled type="datetime-local"
                class="w-full join-item input input-sm"
              >
              <div class="join-item -bg-base-100">
                <span class="align-middle">~</span>
              </div>
              <input
                v-model="search.latestActivityTo" disabled type="datetime-local"
                class="w-full input input-sm join-item"
              >
            </div>
          </div>
        </div>
        <div class="flex">
          <div class="ml-auto" />
          <button class="btn btn-primary btn-sm" @click="() => refresh()">
            {{ t('search-btn') }}
            <icon name="ion:search-outline" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <div class="items-end gap-2 sm:grid sm:grid-cols-2 md:grid-cols-3">
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
          <span class="label-text">{{ t('page') }}</span>
        </label>
        <input v-model.number="search.page" type="number" min="0" max="20" step="1" class="input input-sm">
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">{{ t('page-size') }}</span>
        </label>
        <input
          v-model.number="search.perPage" type="number" min="1" max="20" step="1" class="input input-sm"
          @input="() => { if (search.perPage === 0) search.perPage = 1 }"
        >
      </div>
    </div>
    <div class="overflow-x-auto border rounded-lg border-base-300">
      <table
        description="users"
        class="table table-sm table-zebra"
      >
        <thead>
          <tr>
            <th>{{ t('user') }}</th>
            <th>{{ t('roles') }}</th>
            <th>{{ t('email') }}</th>
            <th>{{ t('registered-at') }}</th>
            <th>{{ t('last-activity') }}</th>
            <th />
          </tr>
        </thead>
        <tbody
          class="transition-opacity origin-center transition-filter"
          :class="{
            'opacity-30 saturate-50 blur-md': pending,
          }"
        >
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="flex items-center space-x-3">
                <div class="avatar">
                  <div class="w-12 h-12 mask mask-squircle">
                    <img :src="user.avatarSrc" alt="avatar">
                  </div>
                </div>
                <div>
                  <nuxt-link-locale
                    class="font-bold whitespace-nowrap"
                    :to="{ name: 'user-handle', params: { handle: `@${user.safeName}` } }"
                  >
                    {{ user.name }}
                  </nuxt-link-locale>
                  <div class="text-sm opacity-50 whitespace-nowrap">
                    {{ t(localeKey.country(user.flag || CountryCode.Unknown)) }}
                  </div>
                </div>
              </div>
            </td>
            <td>
              <span v-for="role in user.roles" :key="user.id + role" class="badge badge-sm whitespace-nowrap">
                {{ t(localeKey.role(role)) }}
              </span>
            </td>
            <td><a class="link g-link-style" :href="`mailto:${user.email}`">{{ user.email }}</a></td>
            <td>
              <time class="whitespace-nowrap" :datetime="user.registeredAt.toString()">{{
                user.registeredAt.toLocaleString(locale) }}</time>
            </td>
            <td>
              <time class="whitespace-nowrap" :datetime="user.lastActivityAt.toString()">{{
                user.lastActivityAt.toLocaleString(locale) }}</time>
            </td>
            <th>
              <nuxt-link-locale
                :to="{
                  name: 'admin-users-id',
                  params: {
                    id: user.id,
                  },
                }" class="btn btn-ghost btn-xs whitespace-nowrap"
              >
                {{ t('details') }}
              </nuxt-link-locale>
            </th>
          </tr>
        </tbody>
      </table>
      <div
        class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none transition-filter blur-sm" :class="{
          'opacity-100 !blur-none': pending,
        }"
      >
        <div class="m-auto loading loading-lg" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
