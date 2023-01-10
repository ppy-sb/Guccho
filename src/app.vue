<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppConfig } from '#app'
// @ts-expect-error string, no declaration file exists
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import { useSafariDetector } from '#imports'

const appConfig = useAppConfig()
const safari = ref(true)
const modalContainer = ref()
const confirmed = useCookie('confirmed-website')

const confirmedWebsite = computed(() => confirmed.value === 'ok')

const checked = ref(false)

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
})
// const colorMode = useColorMode()
</script>

<template>
  <div
    :class="[
      safari ? 'safari' : 'not-safari',
    ]"
  >
    <t-modal-container ref="modalContainer" :teleport-id="config.appModalTeleportTargetId">
      <teleport to="body">
        <app-navbar :disabled="modalContainer?.stat === 'show'" />
      </teleport>
      <div v-if="appConfig.needConfirmWebsite && !confirmedWebsite" class="flex h-screen items-center">
        <div class="card bg-base-200 shadow-xl px-16 mx-auto gap-8">
          <div class="card-body">
            <svg class="remix text-white invert">
              <use :xlink:href="`${remixiconUrl}#ri-folder-warning-line`" />
            </svg>
            <div class="form-control">
              <label class="cursor-pointer label">
                <input v-model="checked" type="checkbox" class="checkbox checkbox-error mx-2">
                <span class="label-text text-4xl">I understand this is not the <a class="link" href="https://osu.ppt.sh">Official Osu Website</a></span>
              </label>
            </div>
            <div class="grid grid-cols-2 items-baseline">
              <div>
                <t-button
                  :class=" {
                    invisible: !checked,
                  }" variant="primary" class="w-80" @click="confirmed = 'ok'"
                >
                  Confirm
                </t-button>
              </div>
              <a class="link text-center" href="https://osu.ppy.sh">No, take me to the official one pls</a>
            </div>
          </div>
        </div>
      </div>
      <template v-else>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </template>
    </t-modal-container>
  </div>
</template>

<style lang="postcss">
.not-safari {
  & .custom-container {
    @apply drop-shadow-xl
  }
}
</style>
