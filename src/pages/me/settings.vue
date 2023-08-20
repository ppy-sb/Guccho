<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

import md5 from 'md5'
import { CountryCode } from '../../def/country-code'
import { Client, OS } from '~/def/device'

import { TModal, TResponsiveModal } from '#components'
import type { ContentEditor } from '#components'
import { useSession } from '~/store/session'

import type { ArticleProvider } from '$base/server/article'
import { UserPrivilege } from '~/def/user'

// eslint-disable-next-line antfu/no-const-enum
const enum UploadingAvatarStatus {
  Idle,
  Uploading,
  Succeed,
  Errored,
}

const app$ = useNuxtApp()
const config = useAppConfig()
const route = useRoute()
const { t, locale } = useI18n()
const session = useSession()
const dyn = await useDynamicSettings()

definePageMeta({
  middleware: ['auth'],
  alias: ['/home/account/edit'],
})

useHead({
  titleTemplate: `${t('titles.settings')} - ${config.title}`,
})

const { data: user, refresh: refreshSettings } = await useAsyncData(() => app$.$client.me.settings.query())
const { data: sessions, refresh: refreshSession, pending: pendingSession } = await useAsyncData(() => app$.$client.me.sessions.query())

if (!user.value) {
  await navigateTo({
    name: 'auth-login',
    query: {
      redirect: route.fullPath,
    },
  })
}
const unchanged = shallowRef({ ...user.value as Exclude<typeof user['value'], null> })

const profile = shallowRef<ArticleProvider.JSONContent>()
const profileEdited = shallowRef(false)
const editor = shallowRef<InstanceType<typeof ContentEditor>>()

const newAvatar = shallowRef<File>()
const newAvatarURL = shallowRef<string>()
const cropper = shallowRef<InstanceType<typeof Cropper> | null>(null)
const croppedAvatar = shallowRef<ArrayBuffer>()
const avatarError = shallowRef<string>()

if (user.value?.profile) {
  const pf = user.value.profile
  if (pf.raw) {
    profile.value = pf.raw
  }
}

const uploadingAvatarStat = shallowRef<UploadingAvatarStatus>(UploadingAvatarStatus.Idle)
const changeAvatar = shallowRef<InstanceType<typeof TModal>>()
const changePassword = shallowRef<InstanceType<typeof TModal>>()

const errorMessage = shallowRef<string[]>([])
const updateResult = shallowRef(false)
const posting = shallowRef(false)

const changePasswordForm = shallowReactive<{
  oldPassword?: string
  newPassword?: string
  repeatNewPassword?: string
}>({
  oldPassword: undefined,
  newPassword: undefined,
  repeatNewPassword: undefined,
})
const changePasswordError = shallowRef('')

// compatible with stable client: change avatar
const showChangeAvatar = route.hash === '#avatar'

async function saveAvatar() {
  if (!croppedAvatar.value) {
    return
  }

  uploadingAvatarStat.value = UploadingAvatarStatus.Uploading

  const url = await app$.$client.me.changeAvatar.mutate({ avatar: new Uint8Array(croppedAvatar.value) })

  uploadingAvatarStat.value = UploadingAvatarStatus.Succeed
  newAvatarURL.value = url
  session.setAvatarTimestamp()
  await refreshSettings()
  editor.value?.reload()
}
async function updateUserSettings() {
  dyn.save()
  if (!user.value) {
    return
  }
  errorMessage.value = []
  const updateData = {
    name:
      user.value.name !== unchanged.value.name ? user.value.name : undefined,
    email:
      user.value.email !== unchanged.value.email ? user.value.email : undefined,
    flag:
      user.value.flag !== unchanged.value.flag ? user.value.flag : undefined,
  }
  posting.value = true

  const [result, profileResult] = await Promise.all([
    app$.$client.me.changeSettings.mutate(updateData).catch((error) => {
      errorMessage.value.push(error.message)
    }),
    profile.value && profileEdited.value
      && app$.$client.me.changeUserpage
        .mutate({ profile: profile.value })
        .catch((error) => {
          errorMessage.value.push(error.message)
        }),
  ])
  updateResult.value = true
  posting.value = false
  setTimeout(() => {
    updateResult.value = false
  }, 3000)
  if (result) {
    unchanged.value = { ...unchanged.value, ...result }
    user.value = { ...unchanged.value }
  }
  if (profileResult) {
    profile.value = profileResult.raw
  }
}
async function selectAvatarFile(e: Event) {
  avatarError.value = undefined
  const file = (e?.target as HTMLInputElement)?.files?.[0]
  if (!file) {
    return
  }

  if (!checkAvatar(await file.arrayBuffer())) {
    avatarError.value = t('avatar.size-too-big')
    return
  }

  newAvatar.value = file
  newAvatarURL.value = URL.createObjectURL(file)
}

function crop({ canvas }: { canvas: HTMLCanvasElement }) {
  canvas.toBlob(async (blob) => {
    croppedAvatar.value = await blob?.arrayBuffer()
  }, 'image/png', 1)
}
async function updatePassword(closeModal: () => void) {
  if (!changePasswordForm.newPassword) {
    return
  } // checked by browser
  if (changePasswordForm.newPassword !== changePasswordForm.repeatNewPassword) {
    changePasswordError.value = t('password.new-password-mismatch')
    return
  }
  if (changePasswordForm.oldPassword === changePasswordForm.newPassword) {
    changePasswordError.value = t('password.same-password-as-old')
    return
  }

  const md5HashedPassword = {
    newPassword: md5(changePasswordForm.newPassword),
    oldPassword: md5(changePasswordForm.oldPassword || ''),
  }

  try {
    const result = await app$.$client.me.updatePassword.mutate(md5HashedPassword)
    unchanged.value = {
      ...unchanged.value,
      ...result,
    }
    closeModal()
  }
  catch (error: any) {
    changePasswordError.value = error.message
  }
}

function resetAvatar() {
  newAvatar.value = undefined
  newAvatarURL.value = undefined
  uploadingAvatarStat.value = UploadingAvatarStatus.Idle
}

async function kickSession(session: string) {
  await app$.$client.me.kickSession.mutate({ session })
  refreshSession()
}
</script>

<i18n lang='yaml'>
en-GB:
  reset: revert

  preferences: Preferences
  username: Username
  safe-name: Link
  email: Email
  flag: Flag
  profile: Profile

  status:
    done: Done!
    ready: Save

  avatar:
    change: change
    size-too-big: size too big
    upload:
      click-to-upload: click-to-upload
      placement: '{bold} or drag and drop'
      bold: Click to upload
    status:
      ready: Save
      uploading: Uploading
      done: Done
      abort: Cancel

  password:
    change: change
    literal: Password
    new-password-mismatch: new password not match.
    same-password-as-old: same password.
    old-password: Old Password
    new-password: New Password
    repeat-password: Repeat Password
    ok: confirm
    abort: cancel

  api-key:
    literal: API Key
    placeholder: Your API Key
    request: Request one
    refresh: Request a new one

  session:
    name: Name
    last-activity: Last seen at
    actions: Action
    current: Current Session
    kick: Kick
zh-CN:
  reset: 恢复

  preferences: 设置
  username: 用户名
  safe-name: 引用连接
  email: 电子邮箱
  flag: 国家/地区
  profile: 个人简介

  status:
    done: 完成
    ready: 保存

  avatar:
    change: 更换头像
    size-too-big: 图片大小过大,请控制在2MB以内
    upload:
      click-to-upload: 点击此处上传
      placement: '{bold} 或将图片拖入此处'
      bold: 上传
    status:
      ready: 保存
      uploading: 上传中
      done: 完成
      abort: 取消

  password:
    change: 修改
    literal: 修改密码
    new-password-mismatch: 新密码和确认密码不一致
    same-password-as-old: 新密码和旧密码一致
    old-password: 旧密码
    new-password: 新密码
    repeat-password: 确认密码
    ok: 确认
    abort: 取消

  api-key:
    literal: API 秘钥
    placeholder: 你的API 秘钥
    request: 请求一个
    refresh: 重置你的API秘钥

  session:
    name: 设备名称
    last-activity: 上次活跃时间
    actions: 操作
    current: 我
    kick: 强制下线
</i18n>

<template>
  <section v-if="user" class="container mx-auto custom-container">
    <TResponsiveModal
      ref="changeAvatar"
      v-slot="{ closeModal }"
      class="my-auto"
      @ready="() => /* compatible with stable client */ showChangeAvatar && changeAvatar?.showModal()"
    >
      <div class="p-4 rounded-xl flex flex-col gap-2 shadow-xl bg-gbase-50">
        <div class="flex items-center justify-center w-full">
          <label v-if="!newAvatar" for="dropzone-file" class="dropzone">
            <div
              class="flex flex-col items-center justify-center px-3 pt-5 pb-6"
            >
              <svg
                aria-hidden="true"
                class="w-10 h-10 mb-3 text-gbase-600 dark:text-gbase-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              <i18n-t
                keypath="avatar.upload.placement"
                tag="p"
                class="mb-2 text-sm text-gbase-500 dark:text-gbase-300"
              >
                <template #bold>
                  <span class="font-semibold">{{ t('avatar.upload.click-to-upload') }}</span>
                </template>
              </i18n-t>

              <!-- <p class="text-xs text-gbase-500 dark:text-gbase-300">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p> -->
              <p class="text-sm text-red-500">
                {{ avatarError }}
              </p>
            </div>
            <input id="dropzone-file" accept="image/*" type="file" class="hidden" @change="selectAvatarFile">
          </label>
          <output v-else-if="uploadingAvatarStat !== UploadingAvatarStatus.Succeed" class="drop-shadow m-2 w-96">
            <Cropper
              ref="cropper"
              class="cropper"
              :src="newAvatarURL"
              :stencil-props="{
                aspectRatio: 1,
              }"
              :canvas="{
                minHeight: 64,
                minWidth: 64,
                maxHeight: 640,
                maxWidth: 640,
              }"
              @change="crop"
            />
          </output>
          <img v-else :src="newAvatarURL" class="mask mask-squircle overflow-hidden _avatar w-56 h-56">
        </div>
        <t-button
          v-if="uploadingAvatarStat !== UploadingAvatarStatus.Succeed && newAvatar"
          class="grow"
          :loading="uploadingAvatarStat === UploadingAvatarStatus.Uploading"
          @click="saveAvatar"
        >
          {{
            uploadingAvatarStat === UploadingAvatarStatus.Idle
              ? t('avatar.status.ready')
              : t('avatar.status.uploading')
          }}
        </t-button>
        <t-button
          :variant="uploadingAvatarStat === UploadingAvatarStatus.Succeed ? 'success' : 'gbase'"
          class="grow"
          @click="closeModal(resetAvatar)"
        >
          {{
            uploadingAvatarStat === UploadingAvatarStatus.Succeed
              ? t('avatar.status.done')
              : t('avatar.status.abort')
          }}
        </t-button>
      </div>
    </TResponsiveModal>

    <TModal ref="changePassword" v-slot="{ closeModal }" class="my-auto">
      <div class="card bg-base-100 shadow-lg">
        <form action="#" @submit.prevent="updatePassword(closeModal)">
          <div class="card-body w-96">
            <div class="form-control">
              <label class="label" for="old-password">
                <span class="pl-2 label-text">{{ t('password.old-password') }}</span>
              </label>
              <input
                v-model="changePasswordForm.oldPassword"
                type="password"
                class="input input-sm input-ghost"
                required
              >
            </div>
            <div class="form-control">
              <label class="label" for="new-password">
                <span class="pl-2 label-text">{{ t('password.new-password') }}</span>
              </label>
              <input
                v-model="changePasswordForm.newPassword"
                type="password"
                class="input input-sm input-ghost"
                required
              >
            </div>
            <div class="form-control">
              <label class="label" for="repeat-password">
                <span class="pl-2 label-text">{{ t('password.repeat-password') }}</span>
              </label>
              <input
                v-model="changePasswordForm.repeatNewPassword"
                type="password"
                class="input input-sm input-ghost"
                required
              >
            </div>
            <span class="text-error px-2">{{ changePasswordError }}</span>
          </div>
          <div class="flex p-4 gap-2">
            <t-button size="sm" variant="accent" class="grow">
              <icon name="ic:round-check" class="w-5 h-5" size="100%" /> {{ t('password.ok') }}
            </t-button>
            <t-button
              size="sm"
              variant="secondary"
              class="grow"
              type="button"
              @click="
                closeModal(() => {
                  changePasswordForm = {}
                  changePasswordError = ''
                })
              "
            >
              <icon name="ic:round-clear" class="w-5 h-5" size="100%" />
              {{ t('password.abort') }}
            </t-button>
          </div>
        </form>
      </div>
    </TModal>
    <div class="flex justify-between p-2 items-end">
      <div class="text-3xl font-bold">
        {{ t('preferences') }}
      </div>
      <button
        class="btn btn-sm"
        :class="[
          updateResult ? 'btn-success' : 'btn-accent',
          posting ? 'loading' : '',
        ]"
        type="button"
        @click="updateUserSettings"
      >
        <icon v-if="!posting" :name="updateResult ? 'line-md:confirm' : 'ic:round-save'" class="w-5 h-5 me-1" size="100%" />
        {{ updateResult ? t('status.done') : t('status.ready') }}
      </button>
    </div>

    <div class="flex flex-col flex-wrap justify-between md:flex-row">
      <div class="grow w-full lg:[max-width:50%]">
        <div
          class="flex items-end p-3 overflow-hidden gap-4 lg:mr-4"
        >
          <div class="drop-shadow-md">
            <div class="relative z-10 mask mask-squircle hoverable w-100 self-center [&>img]:hover:blur-lg [&>img]:hover:opacity-50 no-animation">
              <button
                class="absolute top-0 z-20 w-full h-full btn btn-primary hover:bg-primary/50 focus:active:bg-primary/50"
                type="button"
                @click="() => changeAvatar?.showModal()"
              >
                <icon name="ic:round-edit-note" class="w-5 h-5" size="100%" />
                {{ t('avatar.change') }}
              </button>
              <img
                :src="newAvatarURL || `${user.avatarSrc}`"
                class="pointer-events-none _avatar w-40 h-40"
              >
            </div>
          </div>
          <div>
            <h1 class="text-5xl text-left">
              {{ user.name }}
            </h1>
            <h2
              class="text-3xl text-left underline decoration-sky-500 text-gbase-600 dark:text-gbase-300"
            >
              @{{ user.safeName }}
            </h2>
            <div class="pb-4" />
          </div>
        </div>
        <div class="lg:mr-4">
          <label class="label" for="session">
            <span class="pl-3 label-text">{{ t('global.session') }}</span>
          </label>
          <div id="session">
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <!-- <th>
                      <label>
                        <input type="checkbox" class="checkbox">
                      </label>
                    </th> -->
                    <th>{{ t('session.name') }}</th>
                    <th>{{ t('session.last-activity') }}</th>
                    <th>{{ t('session.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- eslint-disable-next-line vue/no-template-shadow -->
                  <tr v-for="session, id of sessions" :key="id">
                    <!-- <th>
                      <label>
                        <input type="checkbox" class="checkbox">
                      </label>
                    </th> -->
                    <td>
                      <div class="flex items-center space-x-3">
                        <div class="avatar">
                          <div class="mask mask-squircle">
                            <icon v-if="session.OS === OS.Unknown" name="carbon:unknown" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.Windows" name="basil:windows-solid" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.macOS" name="ic:baseline-apple" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.iPadOS" name="ic:baseline-apple" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.iOS" name="wpf:iphone" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.Android" name="mingcute:android-2-fill" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.ChromeOS" name="ri:chrome-fill" class="w-9 h-9" />
                            <icon v-if="session.OS === OS.Linux" name="fluent-mdl2:linux-logo-32" class="w-9 h-9" />
                          </div>
                        </div>
                        <div>
                          <div class="font-bold">
                            {{ OS[session.OS] }} <span v-if="session.current" class="badge badge-ghost badge-sm whitespace-nowrap">{{ t('session.current') }}</span>
                          </div>
                          <div class="text-sm opacity-50">
                            {{ Client[session.client] }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {{ session.lastSeen.toLocaleString(locale) }}
                    </td>
                    <th>
                      <button
                        class="btn btn-ghost btn-xs"
                        :class="{ loading: pendingSession }"
                        :disabled="pendingSession || session.current"
                        @click="kickSession(id)"
                      >
                        <icon name="majesticons:logout-half-circle-line" class="w-5 h-5 me-1" size="100%" />{{ t('session.kick') }}
                      </button>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="grow lg:[max-width:50%] mt-4 lg:mt-0 lg:pl-4 pr-2 lg:mr-0">
        <div class="text-red-500">
          {{ errorMessage.join(",") }}
        </div>
        <div class="form-control">
          <label class="label" for="username">
            <span class="pl-3 label-text">{{ t('username') }}</span>
          </label>
          <div
            :class="
              unchanged.name !== user.name && 'input-group input-group-sm'
            "
          >
            <input
              id="username"
              v-model="user.name"
              type="text"
              :placeholder="t('username')"
              class="w-full input input-sm"
              :disabled="!user.roles.includes(UserPrivilege.Supporter)"
              :class="{
                'input-bordered input-primary': unchanged.name !== user.name,
                '!input-ghost border-none': unchanged.name === user.name,
              }"
            >
            <button
              v-if="unchanged.name !== user.name"
              class="btn btn-sm"
              type="button"
              :disabled="unchanged.name === user.name"
              @click="
                () => {
                  if (!user || !unchanged) return
                  user.name = unchanged.name
                }
              "
            >
              {{ t('reset') }}
            </button>
          </div>
        </div>
        <div>
          <label class="label" for="userlink">
            <span class="pl-3 label-text">{{ t('safe-name') }}</span>
          </label>
          <div class="flex gap-4">
            <input
              id="userlink"
              v-model="user.safeName"
              type="text"
              class="input input-sm grow"
              disabled
              :class="{
                'input-bordered input-primary':
                  unchanged.safeName !== user.safeName,
                '!input-ghost border-none':
                  unchanged.safeName === user.safeName,
              }"
            >
            <!-- <button class="btn btn-sm btn-secondary" type="button" disabled>
              request change
            </button> -->
          </div>
        </div>
        <div class="form-control">
          <label class="label" for="email">
            <span class="pl-3 label-text">{{ t('email') }}</span>
          </label>
          <div
            :class="
              unchanged.email !== user.email && 'input-group input-group-sm'
            "
          >
            <input
              id="email"
              v-model="user.email"
              type="email"
              placeholder="abc@123.com"
              class="w-full input input-sm"
              :class="{
                'input-bordered input-primary': unchanged.email !== user.email,
                'input-ghost': unchanged.email === user.email,
              }"
            >
            <button
              v-show="unchanged.email !== user.email"
              class="btn btn-sm"
              type="button"
              :disabled="unchanged.email === user.email"
              @click="
                () => {
                  if (!user || !unchanged) return
                  user.email = unchanged.email
                }
              "
            >
              {{ t('reset') }}
            </button>
          </div>
        </div>
        <div class="form-control">
          <label class="label" for="flag">
            <span class="pl-3 label-text">{{ t('flag') }}</span>
          </label>
          <!-- <t-combo-box v-model="user.flag" size="sm" class="&[button]:w-full" :options="Object.entries(CountryCode).map(([k, v]) => ({ value: v, label: k }))" /> -->
          <div class="flex gap-2 pl-3">
            <img :src="getFlagURL(user.flag)" class="w-6">
            <select v-model="user.flag" class="select select-ghost w-full select-sm">
              <option v-for="countryCode in CountryCode" :key="countryCode" :disabled="countryCode === user.flag || countryCode === CountryCode.Unknown" :selected="countryCode === user.flag" :value="countryCode">
                {{ toCountryName(countryCode) }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <label class="label" for="password">
            <span class="pl-3 label-text">{{ t('password.literal') }}</span>
            <button
              id="#password"
              class="btn btn-sm btn-secondary"
              type="button"
              @click.prevent="() => changePassword?.showModal()"
            >
              <icon name="ic:round-edit-note" class="w-5 h-5" size="100%" /> {{ t('password.change') }}
            </button>
          </label>
        </div>
        <app-dynamic-settings v-model="dyn.data.value" :unchanged="dyn.unchanged.value" />
      </div>
    </div>

    <label class="label" for="profile">
      <span class="pl-3 label-text">{{ t('profile') }}</span>
    </label>
    <lazy-content-editor
      id="profile"
      ref="editor"
      v-model.lazy="profile"
      :html="user.profile?.html"
      class="safari-performance-boost"
      @update:model-value="profileEdited = true"
    />
  </section>
</template>

<style lang="scss" scoped>
.hoverable {
  img,
  .btn {
    transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    overflow: hidden;
    border: none;
  }
  .btn {
    opacity: 0;
  }
  &:hover {
    .btn {
      opacity: 1;
    }
  }
}

.label-text {
  @apply font-semibold;
}

.dropzone {
  @apply flex flex-col justify-center items-center w-full h-64 bg-gbase-50 rounded-lg border-2 border-gbase-300 border-dashed cursor-pointer;
  @apply dark:bg-gbase-700 hover:bg-gbase-100 dark:border-gbase-600 dark:hover:border-gbase-500 dark:hover:bg-gbase-600;
  @apply hover:shadow-lg;
  @apply transition-shadow transition-colors;
}
._avatar {
  min-width: 150px;
  max-width: 200px;
  @apply object-cover aspect-square;
}
</style>
