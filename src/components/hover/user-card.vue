<script setup lang="ts">
import type { inferRouterOutputs } from '@trpc/server'
import type { RouterLinkProps } from 'vue-router'
import type { AppRouter } from '~/server/trpc/routers'

type RouterOutput = inferRouterOutputs<AppRouter>

type User = RouterOutput['user']['userpage']

const props = defineProps<{
  user: User
  to: RouterLinkProps['to']
}>()
</script>

<template>
  <VTooltip delay="{ show: 500, hide: 100 }" placement="right">
    <nuxt-link-locale :to="to as any">
      {{ props.user.name }}
    </nuxt-link-locale>

    <template #popper>
      <div
        class="relative overflow-hidden rounded-lg px-3 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-gbase-900 dark:text-gbase-100 w-min-[16rem]"
      >
        <div v-if="user">
          <div class="flex items-center gap-2">
            <img :src="`https://a.${$config.public.baseUrl}/${props.user.id}`" alt="" class="w-16 h-16 rounded-lg">
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
