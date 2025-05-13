<script lang="ts" setup>
const scrollY = useScrollYObserver()
const { l1Status, l2Status } = useZoomModal()
const { messages } = useToast()
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
      :data-l2-status="l2Status"
      :style="
        l1Status !== 'closed' && {
          'transform-origin': `center calc(${scrollY} * 1px + 50dvh)`,
        }
      "
    >
      <NuxtPage />
    </NuxtLayout>
    <input id="stack-clear" type="radio" name="stack" class="hidden">
    <div class="absolute top-20 right-6">
      <div class="flex flex-col">
        <template v-for="[idx] in messages" :key="idx">
          <t-toast-stack :id="`msg-${idx}`" :messages="messages.get(idx)!" gap="1em" @update:messages="messages.set(idx, $event)" />
          <div v-if="idx !== messages.size - 1" class="my-2" />
        </template>
      </div>
    </div>
    <app-footer class="mt-auto" />
    <div class="z-40 drawer-side">
      <label
        for="app-drawer-toggle"
        aria-label="Close sidebar"
        class="drawer-overlay"
      />
      <ul class="min-h-full p-4 menu w-80 bg-base-200">
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

<style lang="scss">
@use "~/assets/styles/modal.scss" as m;
// $zoom-content-stage1: saturate(0.4) opacity(0.5);
// $zoom-content-stage2: saturate(0.4) opacity(0.2);

$scale: scale(0.98);
$scale2: scale(0.96);

.zoom-modal-container {
  transition-property: transform, filter;
  transition-duration: m.$duration;
  transition-timing-function: m.$animate-function;

  &[data-l1-status="show"] {

    &[data-l2-status="closed"] {
      transform: $scale;
      // filter: $zoom-content-stage1;
    }

    &[data-l2-status="show"] {
      transform: $scale2;
      // filter: $zoom-content-stage2;
    }

  }

}

.zoom-modal-container[data-l2-status="show"] > dialog::backdrop {
  z-index: 1000 !important;
}

#app-drawer .drawer-toggle:checked ~ .drawer-side > .drawer-overlay {
  @apply bg-gbase-950/30 dark:bg-gbase-950/70;
  @apply transition-colors;
  transition-duration: 350ms;
}

#app-drawer .drawer-content > * {
  transition-property: transform, filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 350ms;
  transition-delay: 30ms;

}

#app-drawer .drawer-toggle:checked ~ .drawer-content > * {
  @apply translate-x-5;
  transition-duration: 250ms;
  transition-delay: 50ms;
  filter: saturate(0.5);
}

#layout.safari {
  -webkit-overflow-scrolling: touch;

  .notify-safari-something-will-change {
    will-change: transform, filter;
  }
}
</style>
