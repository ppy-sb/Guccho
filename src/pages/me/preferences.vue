<script setup lang="ts">
import { ref } from 'vue'
import md5 from 'md5'
import { navigateTo } from '#app'
import { generateJSON } from '@tiptap/core'
import { useSession } from '~/store/session'

const changeAvatar = ref<{
  openModal: () => void
}>()
const changePassword = ref<{
  openModal: () => void
}>()

const { $client } = useNuxtApp()
const session = useSession()
if (!session.$state.loggedIn)
  await navigateTo({ name: 'auth-login', query: { back: '1' } })

const _user = await $client.me.fullSecret.query()

if (_user == null)
  await navigateTo({ name: 'auth-login', query: { back: '1' } })

const user = ref({ ..._user } as Exclude<typeof _user, null>)
const unchanged = ref({ ...user.value })
const profile = ref(generateJSON(user.value.profile as string, useEditorExtensions()))
const uploading = ref(0)
const saveAvatar = () => {
  uploading.value = 1
  setTimeout(() => {
    uploading.value = 2
  }, 1000)
}
const updateUser = async () => {
  const updateData = {
    name: user.value.name !== unchanged.value.name ? user.value.name : undefined,
    email: user.value.email !== unchanged.value.email ? user.value.email : undefined,
    profile: profile.value,
  }

  const result = await $client.me.updatePreferences.mutate(updateData)
  if (!result)
    return

  unchanged.value = { ...unchanged.value, ...result }
}

const changePasswordForm = reactive<{
  oldPassword?: string
  newPassword?: string
  repeatNewPassword?: string
}>({
  oldPassword: undefined,
  newPassword: undefined,
  repeatNewPassword: undefined,
})

const changePasswordError = ref('')

const updatePassword = async (closeModal: () => void) => {
  if (!changePasswordForm.newPassword)
    return // checked by browser
  if (changePasswordForm.newPassword !== changePasswordForm.repeatNewPassword) {
    changePasswordError.value = 'new password mismatch'
    return
  }
  if (changePasswordForm.oldPassword === changePasswordForm.newPassword) {
    changePasswordError.value = 'old and new, those are the same...?'
    return
  }

  const md5HashedPassword = {
    newPassword: md5(changePasswordForm.newPassword),
    // TODO: allow empty oldPassword?
    oldPassword: md5(changePasswordForm.oldPassword as string),
  }

  try {
    const result = await $client.me.updatePassword.mutate(md5HashedPassword)
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
</script>

<template>
  <section
    v-if="user"
    class="container mx-auto custom-container"
  >
    <t-modal-root>
      <t-modal-wrapper
        ref="changeAvatar"
        v-slot="{ closeModal }"
      >
        <t-modal class="max-w-3xl">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-center w-full">
              <label
                for="dropzone-file"
                class="dropzone"
              >
                <div class="flex flex-col items-center justify-center px-3 pt-5 pb-6">
                  <svg
                    aria-hidden="true"
                    class="w-10 h-10 mb-3 text-kimberly-600 dark:text-kimberly-400"
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
                  <p class="mb-2 text-sm text-kimberly-500 dark:text-kimberly-300"><span class="font-semibold">Click to
                    upload</span> or drag and drop</p>
                  <p class="text-xs text-kimberly-500 dark:text-kimberly-300">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  class="hidden"
                >
              </label>
            </div>
            <!-- <div im-just-a-spacer /> -->
            <t-button
              class="grow"
              :loading="uploading === 1"
              :variant="uploading === 2 ? 'success' : 'neutral'"
              @click="saveAvatar"
            >
              {{ uploading === 0 ? 'Save' : uploading === 1 ? 'Uploading' : uploading === 2 ? 'done' : '' }}
            </t-button>
            <t-button
              class="grow"
              @click="() => {
                closeModal()
                uploading = 0
              }"
            >
              close
            </t-button>
          </div>
        </t-modal>
      </t-modal-wrapper>
      <t-modal-wrapper
        ref="changePassword"
        v-slot="{ closeModal }"
      >
        <t-modal>
          <template #body>
            <form
              action="#"
              @submit.prevent="updatePassword(closeModal)"
            >
              <div class="card-body w-96">
                <div class="form-control">
                  <label
                    class="label"
                    for="old-password"
                  >
                    <span class="pl-2 label-text">Old Password</span>
                  </label>
                  <input
                    v-model="changePasswordForm.oldPassword"
                    type="password"
                    class="input input-sm input-ghost"
                    required
                  >
                </div>
                <div class="form-control">
                  <label
                    class="label"
                    for="old-password"
                  >
                    <span class="pl-2 label-text">New Password</span>
                  </label>
                  <input
                    v-model="changePasswordForm.newPassword"
                    type="password"
                    class="input input-sm  input-ghost"
                    required
                  >
                </div>
                <div class="form-control">
                  <label
                    class="label"
                    for="old-password"
                  >
                    <span class="pl-2 label-text">Repeat Password</span>
                  </label>
                  <input
                    v-model="changePasswordForm.repeatNewPassword"
                    type="password"
                    class="input input-sm  input-ghost"
                    required
                  >
                </div>
                <span class="text-error px-2">{{ changePasswordError }}</span>
              </div>
              <div class="flex p-4 gap-2">
                <t-button
                  size="sm"
                  variant="accent"
                  class="grow"
                >
                  confirm
                </t-button>
                <t-button
                  size="sm"
                  variant="secondary"
                  class="grow"
                  type="button"
                  @click="closeModal(() => {
                    changePasswordForm = {},
                    changePasswordError = ''
                  })"
                >
                  cancel
                </t-button>
              </div>
            </form>
          </template>
        </t-modal>
      </t-modal-wrapper>
    </t-modal-root>
    <header-default class="!pb-2 !pt-4">
      <header-simple-title-with-sub
        title="preferences"
        class="text-left"
      />
      <button
        class="self-end btn btn-sm btn-warning"
        type="button"
        @click="updateUser"
      >
        update
      </button>
    </header-default>

    <div class="flex flex-col flex-wrap justify-between md:flex-row md:px-4">
      <div class="grow xl:max-w-2xl w-full lg:[max-width:50%]">
        <div
          class="flex items-end justify-center p-3 overflow-hidden shadow-md gap-4 md:justify-start bg-kimberly-200/30 dark:bg-kimberly-700/40 sm:rounded-3xl lg:mr-4"
        >
          <div class="relative z-10 mask mask-squircle hoverable w-100">
            <button
              class="absolute top-0 z-20 w-full h-full btn btn-primary hover:bg-wewak-500/30 hover:active:border-wewak-500/30 no-animation"
              type="button"
              @click="changeAvatar?.openModal"
            >
              change
            </button>
            <img
              :src="user.avatarUrl"
              class="pointer-events-none "
              style="min-width:150px; width:150px;"
            >
          </div>
          <div>
            <h1 class="text-5xl text-left">
              {{ user.name }}
            </h1>
            <h2 class="text-3xl text-left underline decoration-sky-500 text-kimberly-600 dark:text-kimberly-300">
              @{{ user.safeName }}
            </h2>
            <div class="pb-4" />
          </div>
        </div>
      </div>
      <div class="grow lg:[max-width:50%] mt-4 lg:mt-0 lg:ml-4">
        <div class="form-control">
          <label class="label">
            <span class="pl-3 label-text">Username</span>
          </label>
          <div :class="unchanged.name !== user.name && 'input-group input-group-sm'">
            <input
              v-model="user.name"
              type="text"
              placeholder="Username"
              class="w-full input input-sm"
              :class="{
                'input-bordered input-primary': unchanged.name !== user.name,
                'input-ghost': unchanged.name === user.name,
              }"
            >
            <button
              v-if="unchanged.name !== user.name"
              class="btn btn-sm"
              type="button"
              :disabled="unchanged.name === user.name"
              @click="() => {
                if (!user || !unchanged) return
                user.name = unchanged.name
              }"
            >
              revert
            </button>
          </div>
        </div>
        <div>
          <label class="label">
            <span class="pl-3 label-text">Link (safe name)</span>
          </label>
          <div class="flex gap-4">
            <input
              v-model="user.safeName"
              type="text"
              class="input input-sm grow"
              disabled
              :class="{
                'input-bordered input-primary': unchanged.safeName !== user.safeName,
                '!input-ghost border-none': unchanged.safeName === user.safeName,
              }"
            >
            <button
              class="btn btn-sm btn-warning"
              type="button"
            >
              request change
            </button>
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="pl-3 label-text">Email</span>
          </label>
          <div :class="unchanged.email !== user.email && 'input-group input-group-sm'">
            <input
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
              @click="() => {
                if (!user || !unchanged) return
                user.email = unchanged.email
              }"
            >
              revert
            </button>
          </div>
        </div>
        <div>
          <label class="label">
            <span class="pl-3 label-text">Password</span>
          </label>
          <div class="flex gap-4">
            <input
              v-model="user.secrets.password"
              type="password"
              placeholder="Your Password"
              class="input input-sm grow"
              disabled
              :class="{
                'input-bordered input-primary': unchanged.secrets.apiKey !== user.secrets.apiKey,
                '!input-ghost border-none': unchanged.secrets.apiKey === user.secrets.apiKey,
              }"
            >
            <button
              class="btn btn-sm btn-primary"
              type="button"
              @click="changePassword?.openModal"
            >
              Change
            </button>
          </div>
        </div>
        <div>
          <label class="label">
            <span class="pl-3 label-text">API Key</span>
          </label>
          <div class="flex gap-4">
            <input
              v-model="user.secrets.apiKey"
              type="text"
              placeholder="Your API Key"
              class="input input-sm grow"
              disabled
              :class="{
                'input-bordered input-primary': unchanged.secrets.apiKey !== user.secrets.apiKey,
                '!input-ghost border-none': unchanged.secrets.apiKey === user.secrets.apiKey,
              }"
            >
            <button
              v-if="!user.secrets.apiKey"
              class="btn btn-sm btn-primary"
              type="button"
            >
              Request one
            </button>
            <button
              v-else
              class="btn btn-sm btn-secondary"
              type="button"
            >
              request a new one
            </button>
          </div>
        </div>
      </div>
    </div>

    <label class="label">
      <span class="pl-3 label-text">profile</span>
    </label>
    <lazy-editor
      v-model.lazy="profile"
      class="safari-performance-boost"
    />
  </section>
</template>

<style lang="scss" scoped>
.hoverable {
  img,
  .btn {
    transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    overflow: hidden;
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
  @apply flex flex-col justify-center items-center w-full h-64 bg-kimberly-50 rounded-lg border-2 border-kimberly-300 border-dashed cursor-pointer;
  @apply dark:hover:bg-kimberly-200 dark:bg-kimberly-800 dark:bg-kimberly-300 dark:bg-kimberly-700 hover:bg-kimberly-50 dark:border-kimberly-600 dark:hover:border-kimberly-500 dark:hover:bg-kimberly-600;
  @apply hover:shadow-lg;
  @apply transition-shadow transition-colors;
}
</style>

<style lang="scss">
.safari .safari-performance-boost {
  @apply max-h-80;

  .editor__content {
    @apply overflow-y-auto
  }
}
</style>
