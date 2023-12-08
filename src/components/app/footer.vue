<script lang="ts" setup>
import type { IconLink, UIConfig } from '~/def/config'

const fullYear = new Date().getFullYear()
const runtime = useRuntimeConfig()
const { iconLinks, footerLink, brand } = runtime.public as unknown as { iconLinks: readonly IconLink[] | undefined; footerLink: UIConfig['footerLink']; brand?: UIConfig['brand'] }
</script>

<template>
  <footer>
    <div class="w-full p-4 py-6 lg:py-8">
      <div class="md:flex md:justify-between max-w-screen-xl mx-auto">
        <div class="mb-6 md:mb-0">
          <nuxt-link-locale :to="{ name: 'index' }">
            <span class="flex items-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              <icon v-if="brand" :name="brand.icon" class="h-full mr-2" :class="brand.iconClass" />
              <span>{{ $t('server.name') }}</span>
            </span>
          </nuxt-link-locale>
        </div>
        <div v-if="footerLink" class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
          <template v-for="(col, nm) in footerLink" :key="nm">
            <div v-if="col?.length">
              <h2 class="mb-6 text-sm font-semibold uppercase text-gbase-900 dark:text-white">
                {{ $t(`footer.${nm}`) }}
              </h2>
              <ul class="font-medium text-gbase-500 dark:text-gbase-400">
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
