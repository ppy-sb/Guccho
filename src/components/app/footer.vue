<script lang="ts" setup>
import type { IconLink, UIConfig } from '~/def/config'

const fullYear = new Date().getFullYear()
const runtime = useRuntimeConfig()
const { iconLinks, footerLink } = runtime.public as unknown as { iconLinks: readonly IconLink[] | undefined; footerLink: UIConfig['footerLink'] }
</script>

<template>
  <footer>
    <div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
      <div class="md:flex md:justify-between">
        <div class="mb-6 md:mb-0">
          <nuxt-link-locale :to="{ name: 'index' }" class="flex items-center">
            <icon name="ion:paw" class="h-8 w-auto mr-3" />
            <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">{{ $t('server.name') }}</span>
          </nuxt-link-locale>
        </div>
        <div v-if="footerLink" class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
          <template v-for="(col, nm) in footerLink" :key="nm">
            <div v-if="col?.length">
              <h2 class="mb-6 text-sm font-semibold text-gbase-900 uppercase dark:text-white">
                {{ $t(`footer.${nm}`) }}
              </h2>
              <ul class="text-gbase-500 dark:text-gbase-400 font-medium">
                <li v-for="(i, index) in col" :key="nm + index" class="mb-4">
                  <a :href="i.link" class="hover:underline ">{{ 'localeKey' in i ? $t(i.localeKey) : i.name }}</a>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
      <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <span class="text-sm text-gbase-500 sm:text-center dark:text-gbase-400">© {{ fullYear }} <a href="https://github.com/ppy-sb" class="hover:underline">ppy.sb. All Rights Reserved.
        </a></span>
        <div v-if="iconLinks?.length" class="flex mt-4 space-x-5 sm:justify-center sm:mt-0">
          <a v-for="link in iconLinks" :key="link.name" :href="link.link" class="text-gbase-500 hover:text-gbase-900 dark:hover:text-white">
            <icon :name="link.icon" class="w-4 h-4" />
            <span class="sr-only">{{ link.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
