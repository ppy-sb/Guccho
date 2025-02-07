<script lang="ts" setup>
import type { TRPCError } from '@trpc/server'
import type { NuxtError } from 'nuxt/app'

const props = defineProps<{ error: NuxtError }>()
const scrollY = useScrollYObserver()
const { l1Status } = useZoomModal()

let maybeTRPCError: (TRPCError & { httpStatus: number }) | undefined
// eslint-disable-next-line no-lone-blocks
{
  try {
    maybeTRPCError = JSON.parse(props.error.data as string)
  }
  catch (e) {
    maybeTRPCError = undefined
  }
}

const code = maybeTRPCError?.httpStatus || props.error.statusCode
const _status = maybeTRPCError?.code || props.error.statusMessage || props.error.message

const event = useRequestEvent()
if (event) {
  setResponseStatus(event, code)
}
</script>

<template>
  <nuxt-loading-indicator />
  <div id="app-drawer" class="drawer flex flex-col min-h-[100dvh]">
    <app-nav />
    <input id="app-drawer-toggle" type="checkbox" class="drawer-toggle">
    <!-- Page content here -->
    <NuxtLayout
      id="layout"
      viewport
      :class="safariDetector() ? 'safari' : 'not-safari'"
      class="drawer-content zoom-modal-container overflow-x-clip"
      :data-l1-status="l1Status"
      data-l2-status="closed"
      :style="
        l1Status !== 'closed' && {
          'transform-origin': `center calc(${scrollY} * 1px + 50dvh)`,
        }
      "
    >
      <div v-if="error" class="container custom-container mx-auto pt-10">
        <h1 class="text-4xl">
          {{ code }} {{ _status }}
        </h1>
        <div class="divider" />
        <span class="text-2xl">
          {{ formatGucchoError(error) }}
        </span>
      </div>
    </NuxtLayout>
    <app-footer class="mt-auto" />
    <div class="drawer-side z-40">
      <label
        for="app-drawer-toggle"
        aria-label="Close sidebar"
        class="drawer-overlay"
      />
      <ul class="menu p-4 w-80 min-h-full bg-base-200">
        <app-nav-items>
          <template #start>
            <li>
              <app-nav-brand />
            </li>
          </template>
        </app-nav-items>
      </ul>
    </div>
  </div>
</template>
