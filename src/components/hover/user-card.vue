<template>
  <VTooltip delay="{ show: 500, hide: 100 }" placement="right">
    <nuxt-link :to="to">
      {{ props.user.name }}
    </nuxt-link>

    <template #popper>
      <div
        class="relative overflow-hidden rounded-lg px-3 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-kimberly-900 dark:text-kimberly-100 w-min-[16rem]"
      >
        <div v-if="user">
          <div class="flex items-center gap-2">
            <img
              :src="`https://a.${config.baseUrl}/${props.user.id}`"
              alt=""
              class="w-16 h-16 rounded-lg"
            >
            <div>
              <h1 class="text-xl">
                {{ props.user.name }}
              </h1>
              <h1>
                <img class="w-auto h-6" :src="getFlagURL(props.user.flag)">
              </h1>
            </div>
          </div>
        </div>
      </div>
    </template>
  </VTooltip>
</template>

<script setup lang="ts">
import { useAppConfig } from '#app'
import { RouterLinkProps } from 'vue-router'
import { BaseUser } from '~/types/user'
import { IdType } from '~/server/trpc/config'
import { getFlagURL } from '~/common/varkaUtils'
// const runtimeConfig = useAppConfig()
const config = useAppConfig()
const props = defineProps<{
  user: BaseUser<IdType>,
  to: RouterLinkProps['to']
}>()
</script>
