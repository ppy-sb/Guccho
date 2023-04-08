<script setup lang="ts">
import md5 from 'md5'
import type { JSONContent } from '@tiptap/core'
import { Cropper } from 'vue-advanced-cropper'
import { useSession } from '~/store/session'
import { checkAvatar } from '~/utils'

import 'vue-advanced-cropper/dist/style.css'
import type Edit from '~/components/editor/index.vue'

definePageMeta({
  middleware: ['auth'],
})

const app$ = useNuxtApp()
const config = useAppConfig()
const route = useRoute()

const session = useSession()

useHead({
  titleTemplate: `Settings - ${config.title}`,
})
definePageMeta({
  middleware: ['auth'],
})

const { data: user, refresh } = await useAsyncData(() => app$.$client.me.settings.query())

if (!user.value) {
  await navigateTo({
    name: 'auth-login',
    query: {
      redirect: route.fullPath,
    },
  })
}
const unchanged = ref({ ...user.value as Exclude<typeof user['value'], null> })

const profile = ref<JSONContent>()
const profileEdited = ref(false)
const editor = ref<InstanceType<typeof Edit>>()

const newAvatar = ref<File>()
const newAvatarURL = ref<string>()
const cropper = ref<InstanceType<typeof Cropper> | null>(null)
const croppedAvatar = ref<ArrayBuffer>()
const avatarError = ref<string>()
async function selectAvatarFile(e: Event) {
  avatarError.value = undefined
  const file = (e?.target as HTMLInputElement)?.files?.[0]
  if (!file) {
    return
  }

  if (!checkAvatar(await file.arrayBuffer())) {
    avatarError.value = 'size too big'
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

const uploadingAvatarStat = ref<'idle' | 'uploading' | 'succeed' | 'errored'>('idle')
const changeAvatar = ref<{
  openModal: (arg0?: CallableFunction) => void
}>()
const changePassword = ref<{
  openModal: (arg0?: CallableFunction) => void
}>()
async function saveAvatar() {
  if (!croppedAvatar.value) {
    return
  }

  uploadingAvatarStat.value = 'uploading'

  // const ab = await newAvatar.value.arrayBuffer()
  const url = await app$.$client.me.changeAvatar.mutate({ avatar: new Uint8Array(croppedAvatar.value) })

  uploadingAvatarStat.value = 'succeed'
  newAvatarURL.value = url
  session.setAvatarTimestamp()
  await refresh()
  editor.value?.reload()
}
// update settings
const errorMessage = ref<string[]>([])
const updateResult = ref(false)
const posting = ref(false)
async function updateUserSettings() {
  if (!user.value) {
    return
  }
  errorMessage.value = []
  const updateData = {
    name:
      user.value.name !== unchanged.value.name ? user.value.name : undefined,
    email:
      user.value.email !== unchanged.value.email ? user.value.email : undefined,
  }
  posting.value = true

  const [result, profileResult] = await Promise.all([
    app$.$client.me.changeSettings.mutate(updateData).catch((error) => {
      errorMessage.value.push(error.message)
    }),
    profile.value
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
  if (!result) {
    return
  }
  unchanged.value = { ...unchanged.value, ...result }
  if (!profileResult) {
    return
  }
  profile.value = profileResult.raw
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

async function updatePassword(closeModal: () => void) {
  if (!changePasswordForm.newPassword) {
    return
  } // checked by browser
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
onBeforeMount(() => {
  if (!user.value?.profile) {
    return
  }
  profile.value = user.value.profile.raw
})
</script>

<template>
  <section v-if="user" class="container mx-auto custom-container">
    <t-modal-root>
      <t-modal-wrapper ref="changeAvatar" v-slot="{ closeModal }">
        <t-modal class="max-w-3xl">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-center w-full">
              <label v-if="!newAvatar" for="dropzone-file" class="dropzone">
                <div

                  class="flex flex-col items-center justify-center px-3 pt-5 pb-6"
                >
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
                  <p
                    class="mb-2 text-sm text-kimberly-500 dark:text-kimberly-300"
                  >
                    <span class="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <!-- <p class="text-xs text-kimberly-500 dark:text-kimberly-300">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p> -->
                  <p class="text-sm text-red-500">
                    {{ avatarError }}
                  </p>
                </div>
                <input id="dropzone-file" accept="image/*" type="file" class="hidden" @change="selectAvatarFile">
              </label>
              <output v-else-if="uploadingAvatarStat !== 'succeed'" class="drop-shadow m-2 w-96">
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
              <img v-else :src="newAvatarURL" class="mask mask-squircle overflow-hidden _avatar">
            </div>
            <t-button
              class="grow"
              :loading="uploadingAvatarStat === 'uploading'"
              :disabled="uploadingAvatarStat === 'succeed'"
              :variant="uploadingAvatarStat === 'succeed' ? 'success' : 'neutral'"
              @click="saveAvatar"
            >
              {{
                uploadingAvatarStat === 'idle'
                  ? "Save"
                  : uploadingAvatarStat === 'uploading'
                    ? "Uploading"
                    : uploadingAvatarStat === 'succeed'
                      ? "done"
                      : ""
              }}
            </t-button>
            <t-button
              class="grow"
              @click="
                () => {
                  closeModal(() => {
                    newAvatar = undefined
                    newAvatarURL = undefined
                    uploadingAvatarStat = 'idle';
                  });
                }
              "
            >
              close
            </t-button>
          </div>
        </t-modal>
      </t-modal-wrapper>

      <t-modal-wrapper ref="changePassword" v-slot="{ closeModal }">
        <t-modal>
          <template #body>
            <form action="#" @submit.prevent="updatePassword(closeModal)">
              <div class="card-body w-96">
                <div class="form-control">
                  <label class="label" for="old-password">
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
                  <label class="label" for="old-password">
                    <span class="pl-2 label-text">New Password</span>
                  </label>
                  <input
                    v-model="changePasswordForm.newPassword"
                    type="password"
                    class="input input-sm input-ghost"
                    required
                  >
                </div>
                <div class="form-control">
                  <label class="label" for="old-password">
                    <span class="pl-2 label-text">Repeat Password</span>
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
                  confirm
                </t-button>
                <t-button
                  size="sm"
                  variant="secondary"
                  class="grow"
                  type="button"
                  @click="
                    closeModal(() => {
                      (changePasswordForm = {}), (changePasswordError = '');
                    })
                  "
                >
                  cancel
                </t-button>
              </div>
            </form>
          </template>
        </t-modal>
      </t-modal-wrapper>
    </t-modal-root>
    <!-- used as padding placeholders -->
    <header-simple-title-with-sub />
    <div class="container mx-auto">
      <div class="flex justify-between p-2 items-baseline">
        <div class="text-3xl font-bold">
          preferences
        </div>
        <button
          class="self-end btn btn-sm"
          :class="[
            updateResult ? 'btn-success' : 'btn-accent',
            posting ? 'loading' : '',
          ]"
          type="button"
          @click="updateUserSettings"
        >
          {{ updateResult ? "done!" : "update" }}
        </button>
      </div>
    </div>

    <div class="flex flex-col flex-wrap justify-between md:flex-row">
      <div class="grow xl:max-w-2xl w-full lg:[max-width:50%]">
        <div
          class="flex items-end justify-center p-3 overflow-hidden shadow-md gap-4 md:justify-start bg-base-200/30 dark:bg-kimberly-700/40 sm:rounded-3xl lg:mr-4"
        >
          <div class="relative z-10 mask mask-squircle hoverable w-100 self-center">
            <button
              class="absolute top-0 z-20 w-full h-full btn btn-primary hover:bg-wewak-500/30 hover:active:border-wewak-500/30 no-animation"
              type="button"
              @click="() => changeAvatar?.openModal()"
            >
              change
            </button>
            <img
              :src="newAvatarURL || `${user.avatarSrc}?${Date.now()}`"
              class="pointer-events-none _avatar"
            >
          </div>
          <div>
            <h1 class="text-5xl text-left">
              {{ user.name }}
            </h1>
            <h2
              class="text-3xl text-left underline decoration-sky-500 text-kimberly-600 dark:text-kimberly-300"
            >
              @{{ user.safeName }}
            </h2>
            <div class="pb-4" />
          </div>
        </div>
      </div>
      <div class="grow lg:[max-width:50%] mt-4 lg:mt-0 lg:ml-4">
        <div class="text-red-500">
          {{ errorMessage.join(",") }}
        </div>
        <div class="form-control">
          <label class="label">
            <span class="pl-3 label-text">Username</span>
          </label>
          <div
            :class="
              unchanged.name !== user.name && 'input-group input-group-sm'
            "
          >
            <input
              v-model="user.name"
              type="text"
              placeholder="Username"
              class="w-full input input-sm"
              :disabled="user.roles.includes('supporter')"
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
              @click="
                () => {
                  if (!user || !unchanged) return;
                  user.name = unchanged.name;
                }
              "
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
          <label class="label">
            <span class="pl-3 label-text">Email</span>
          </label>
          <div
            :class="
              unchanged.email !== user.email && 'input-group input-group-sm'
            "
          >
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
              @click="
                () => {
                  if (!user || !unchanged) return;
                  user.email = unchanged.email;
                }
              "
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
                'input-bordered input-primary':
                  unchanged.secrets.apiKey !== user.secrets.apiKey,
                '!input-ghost border-none':
                  unchanged.secrets.apiKey === user.secrets.apiKey,
              }"
            >
            <button
              class="btn btn-sm btn-secondary"
              type="button"
              @click="() => changePassword?.openModal()"
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
              class="input input-sm grow blur-sm hover:blur-none"
              disabled
              :class="{
                'input-bordered input-primary':
                  unchanged.secrets.apiKey !== user.secrets.apiKey,
                '!input-ghost border-none':
                  unchanged.secrets.apiKey === user.secrets.apiKey,
              }"
            >
            <button
              v-if="!user.secrets.apiKey"
              class="btn btn-sm btn-primary"
              type="button"
              disabled
            >
              Request one
            </button>
            <button
              v-else
              class="btn btn-sm btn-secondary"
              type="button"
              disabled
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
      ref="editor"
      v-model.lazy="profile"
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
  @apply flex flex-col justify-center items-center w-full h-64 bg-kimberly-50 rounded-lg border-2 border-kimberly-300 border-dashed cursor-pointer;
  @apply dark:hover:bg-base-200 dark:bg-kimberly-300 dark:bg-kimberly-700 hover:bg-kimberly-50 dark:border-kimberly-600 dark:hover:border-kimberly-500 dark:hover:bg-kimberly-600;
  @apply hover:shadow-lg;
  @apply transition-shadow transition-colors;
}
._avatar {
  min-width: 150px;
  max-width: 200px;
  @apply object-cover aspect-square;
}
</style>

<style lang="scss">
.safari .safari-performance-boost {
  @apply max-h-80;

  .editor__content {
    @apply overflow-y-auto;
  }
}
</style>
