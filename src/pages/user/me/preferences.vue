<template>
  <section class="container mx-auto">
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
                  <p class="mb-2 text-sm text-kimberly-500 dark:text-kimberly-600 dark:text-kimberly-400"><span class="font-semibold">Click to
                    upload</span> or drag and drop</p>
                  <p class="text-xs text-kimberly-500 dark:text-kimberly-600 dark:text-kimberly-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
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
    <form action="#" method="POST">
      <div class="flex gap-8 flex-col flex-wrap md:flex-row">
        <div
          class="grow overflow-hidden xl:max-w-2xl flex gap-4 justify-center md:justify-start items-end bg-kimberly-200 dark:bg-kimberly-800 sm:rounded-3xl p-4 shadow-3xl lg:[max-width:50%]"
        >
          <div class="relative mask mask-squircle z-10 hoverable w-100">
            <button class="btn btn-primary no-animation absolute z-20 top-0 w-full h-full" type="button" @click="changeAvatar.openModal">
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
        <div class="grow lg:[max-width:50%]">
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
              <button class="btn" type="button" @click="user.name = unchanged.name">
                reset
              </button>
            </div>
          </div>
          <div>
            <label class="label">
              <span class="label-text pl-3">link</span>
            </label>
            <div class="flex gap-4">
              <input
                v-model="user.safeName"
                type="text"
                placeholder="Type here"
                class="input grow"
                disabled
                :class="{
                  'input-bordered input-primary': unchanged.safeName !== user.safeName,
                  'input-ghost': unchanged.safeName === user.safeName
                }"
              >
              <button class="btn btn-warning" type="button">
                request change
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- <label class="label">
        <span class="label-text pl-3">What is your name?</span>
      </label>
      <input v-model="user.name" type="text" placeholder="Type here" class="input input-ghost w-full max-w-xs"> -->
    </form>
  </section>
</template>

<script setup>
import { demoUser } from '~~/src/prototyping/objects/user'
const unchanged = demoUser
const user = reactive({ ...demoUser })
const changeAvatar = ref(null)

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

<style lang="scss" scoped>
.hoverable {

  img,
  .btn {
    transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  // img {
  //   opacity: 1;
  // }

  .btn {
    opacity: 0;
  }

  &:hover {
    // img {
    //   opacity: 0;
    // }

    .btn {
      opacity: 0.8;
    }
  }
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
