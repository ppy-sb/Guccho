
<script setup>
import { demoUser } from '~~/src/prototyping/objects/user'
const unchanged = demoUser
const bioEditorMode = ref('preview')
const user = reactive({ ...demoUser, secrets: { ...unchanged.secrets } })
const changeAvatar = ref(null)
const repeatPassword = ref(unchanged.secrets.password)

const bio = ref('')
const editBio = (e) => {
  bio.value = e.target.innerText

  console.log(bio.value)
}
const uploading = ref(0)
const saveAvatar = () => {
  uploading.value = 1
  setTimeout(() => {
    uploading.value = 2

    // setTimeout(() => {
    //   changeAvatar.value.closeModal()
    // }, 700)
  }, 1000)
}
</script>

<template>
  <section class="container custom-container mx-auto">
    <t-modal-page>
      <t-modal-wrapper ref="changeAvatar" v-slot="{ closeModal }">
        <t-modal class="max-w-3xl">
          <div class="flex flex-col gap-2">
            <div class="flex justify-center items-center w-full">
              <label for="dropzone-file" class="dropzone">
                <div class="flex flex-col justify-center items-center pt-5 pb-6 px-3">
                  <svg
                    aria-hidden="true"
                    class="mb-3 w-10 h-10 text-kimberly-600 dark:text-kimberly-400"
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
                <input id="dropzone-file" type="file" class="hidden">
              </label>
            </div>
            <div im-just-a-spacer />
            <dv-button class="grow" :loading="uploading === 1" :type="uploading === 2 && 'success'" @click="saveAvatar">
              {{ uploading === 0 ? 'Save' : uploading === 1 ? 'Uploading' : uploading === 2 ? 'done' : '' }}
            </dv-button>
            <dv-button
              class="grow"
              @click="() => {
                closeModal()
                uploading = 0
              }"
            >
              close
            </dv-button>
          </div>
        </t-modal>
      </t-modal-wrapper>
    </t-modal-page>
    <header-default class="!pb-2 !pt-4" title="preferences" />
    <form action="#" method="POST" class="px-4">
      <div class="flex flex-col flex-wrap md:flex-row">
        <div class="grow xl:max-w-2xl w-full lg:[max-width:50%]">
          <div
            class="flex gap-4 justify-center md:justify-start items-end bg-kimberly-200/30 dark:bg-kimberly-700/40 sm:rounded-3xl shadow-md p-3 lg:mr-4 overflow-hidden"
          >
            <div class="relative mask mask-squircle z-10 hoverable w-100">
              <button
                class="btn btn-primary hover:bg-wewak-500/30 hover:active:border-wewak-500/30 no-animation absolute z-20 top-0 w-full h-full"
                type="button"
                @click="changeAvatar.openModal"
              >
                change
              </button>
              <img src="~/assets/images/1.png" class="pointer-events-none " style="min-width: 150px; width: 150px;">
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
          <div>
            <label class="label">
              <span class="label-text pl-3">Username</span>
            </label>
            <div class="flex gap-4">
              <input
                v-model="user.name"
                type="text"
                placeholder="Username"
                class="input grow"
                :class="{
                  'input-bordered input-primary': unchanged.name !== user.name,
                  'input-ghost': unchanged.name === user.name
                }"
              >
              <button
                class="btn"
                type="button"
                :disabled="unchanged.name === user.name"
                @click="user.name = unchanged.name"
              >
                cancel
              </button>
            </div>
          </div>
          <div>
            <label class="label">
              <span class="label-text pl-3">Link (safe name)</span>
            </label>
            <div class="flex gap-4">
              <input
                v-model="user.safeName"
                type="text"
                class="input grow"
                disabled
                :class="{
                  'input-bordered input-primary': unchanged.safeName !== user.safeName,
                  '!input-ghost border-none': unchanged.safeName === user.safeName
                }"
              >
              <button class="btn btn-warning" type="button">
                request change
              </button>
            </div>
          </div>
          <div>
            <label class="label">
              <span class="label-text pl-3">Email</span>
            </label>
            <div class="flex gap-4">
              <input
                v-model="user.email"
                type="email"
                placeholder="abc@123.com"
                class="input grow"
                :class="{
                  'input-bordered input-primary': unchanged.email !== user.email,
                  'input-ghost': unchanged.email === user.email
                }"
              >
              <button
                class="btn"
                type="button"
                :disabled="unchanged.email === user.email"
                @click="user.email = unchanged.email"
              >
                cancel
              </button>
            </div>
          </div>
          <div>
            <div class="flex gap-4 items-end">
              <div class="grow">
                <label class="label">
                  <span class="label-text pl-3">Password</span>
                </label>
                <input
                  v-model="user.secrets.password"
                  type="password"
                  placeholder="Type here"
                  class="input w-full"
                  :class="{
                    'input-bordered input-primary': unchanged.secrets.password !== user.secrets.password,
                    'input-ghost': unchanged.secrets.password === user.secrets.password
                  }"
                >
                <label class="label">
                  <span class="label-text pl-3">Repeat Password</span>
                </label>
                <input
                  v-model="repeatPassword"
                  type="password"
                  placeholder="Type here"
                  class="input w-full"
                  :class="{
                    'input-bordered input-primary': unchanged.secrets.password !== repeatPassword,
                    'input-ghost': unchanged.secrets.password === repeatPassword
                  }"
                >
              </div>
              <button
                class="btn"
                type="button"
                :disabled="unchanged.secrets.password === repeatPassword && unchanged.secrets.password === user.secrets.password"
                @click="() => {
                  user.secrets.password = unchanged.secrets.password
                  repeatPassword = unchanged.secrets.password
                }"
              >
                cancel
              </button>
            </div>
          </div>
          <div>
            <label class="label">
              <span class="label-text pl-3">API Key</span>
            </label>
            <div class="flex gap-4">
              <input
                v-model="user.secrets.apiKey"
                type="text"
                placeholder="Your API Key"
                class="input grow"
                disabled
                :class="{
                  'input-bordered input-primary': unchanged.secrets.apiKey !== user.secrets.apiKey,
                  '!input-ghost border-none': unchanged.secrets.apiKey === user.secrets.apiKey
                }"
              >
              <button v-if="!user.secrets.apiKey" class="btn btn-primary" type="button">
                Request one
              </button>
              <button v-else class="btn btn-secondary" type="button">
                request a new one
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="mx-auto max-w-7xl">
        <label class="label">
          <span class="label-text pl-3">BIO</span>
        </label>
        <div class="mt-1 card bg-kimberly-200/40 rounded-3xl">
          <t-tabs v-model="bioEditorMode" variant="bordered">
            <t-tab class="grow" disabled />
            <t-tab class="lg:tab-lg" value="edit">
              edit
            </t-tab>
            <t-tab class="lg:tab-lg" value="preview">
              preview
            </t-tab>
            <t-tab class="grow" disabled />
          </t-tabs>
          <div
            v-if="bioEditorMode === 'edit'"
            class="card-body rounded-none rounded-bl-3xl rounded-br-3xl"
            role="textbox"
            aria-multiline="true"
            contenteditable="plaintext-only"
            @input="editBio"
          >
            {{ bio }}
          </div>
          <div v-else class="card-body prose">
            <Markdown :source="bio" />
          </div>
        </div>
      </div>
    </form>
  </section>
</template>

<style lang="scss" scoped>
.hoverable {

  img,
  .btn {
    transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    overflow: hidden;
  }

  .btn {
    opacity: 0;
  }

  &:hover {
    // img {
    //   opacity: 0;
    // }

    .btn {
      opacity: 1;
    }
  }
}

.label-text {
  @apply font-semibold
}
</style>
<style lang="postcss">
.dropzone {
  @apply flex flex-col justify-center items-center w-full h-64 bg-kimberly-50 rounded-lg border-2 border-kimberly-300 border-dashed cursor-pointer;
  @apply dark:hover:bg-kimberly-200 dark:bg-kimberly-800 dark:bg-kimberly-300 dark:bg-kimberly-700 hover:bg-kimberly-50 dark:border-kimberly-600 dark:hover:border-kimberly-500 dark:hover:bg-kimberly-600;
  @apply hover:shadow-lg;
  @apply transition-shadow transition-colors;
}
</style>
