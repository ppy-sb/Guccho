<script lang="ts" setup>
const route = useRoute()
const safari = shallowRef(false)
const scrollY = useScrollYObserver()
const scrollPercent = ref(0)
const { status } = useZoomModal()
useHead({
  htmlAttrs: {
    class: 'dark',
  },
})

onBeforeMount(() => {
  safari.value = useSafariDetector()
})

const listener = () => (scrollPercent.value = getScrollPercent())
onBeforeMount(() => {
  window.addEventListener('scroll', listener)
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', listener)
  })
  scrollPercent.value = getScrollPercent()
})
watch(route, listener)
function getScrollPercent() {
  const scrollTop = (document.documentElement.scrollTop ?? document.body.scrollTop)
  const scrollHeight = (document.documentElement.scrollHeight ?? document.body.scrollHeight)
  const clientHeight = document.documentElement.clientHeight
  // console.log(scrollTop, scrollHeight, clientHeight)

  return (scrollTop / (scrollHeight - clientHeight))
}
</script>

<template>
  <nuxt-loading-indicator />
  <div id="app-drawer" class="drawer flex flex-col min-h-[100dvh] relative">
    <app-nav />
    <input id="app-drawer-toggle" type="checkbox" class="drawer-toggle">
    <!-- Page content here -->
    <NuxtLayout
      id="layout"
      viewport
      :class="[safari ? 'safari' : 'not-safari']"
      class="drawer-content zoom-modal-container overflow-x-clip"
      :data-l1-status="status"
      data-l2-status="hidden"
      :style="
        status !== 'closed' && {
          'transform-origin': `center calc(${scrollY} * 1px + 50dvh)`,
        }
      "
    >
      <NuxtPage />
    </NuxtLayout>
    <app-footer class="mt-auto" />
    <div class="drawer-side z-40">
      <label for="app-drawer-toggle" aria-label="Close sidebar" class="drawer-overlay" />
      <ul class="menu p-4 w-80 min-h-full bg-green-700">
        <app-nav-items>
          <template #start>
            <li>
              <app-nav-brand />
            </li>
          </template>
        </app-nav-items>
      </ul>
    </div>
    <div
      class="parallax"
      :style="{
        '--scroll': scrollPercent,
      }"
    >
      <div class="parallax__layer parallax__layer__0">
        <img
          src="~/assets/images/Sky.png"
        >
      </div>
      <!-- <div class="parallax__layer parallax__layer__1">
        <img
          src="https://github.com/samdbeckham/blog/blob/master/dev/_assets/images/articles/firewatch/layer_1.png?raw=true"
        >
      </div> -->
      <div class="parallax__layer parallax__layer__2">
        <img
          src="~/assets/images/Middle.png"
        >
      </div>
      <div class="parallax__layer parallax__layer__3">
        <img
          src="~/assets/images/Foreground.png"
        >
      </div>
      <div class="parallax__layer parallax__layer__4">
        <img
          src="~/assets/images/Ground_01.png"
        >
      </div>
      <div class="parallax__layer parallax__layer__5">
        <img
          src="~/assets/images/Ground_02.png"
        >
      </div>
      <!-- <div class="parallax__layer parallax__layer__6">
        <img
          src="~/assets/images/Snow.png"
        >
      </div> -->
    </div>
  </div>
</template>

<style lang="scss">
@import "~/assets/styles/modal.scss";
$zoom-content-stage1: saturate(0.4) opacity(0.8);
$zoom-content-stage2: saturate(0.4) opacity(0.2);

$scale: scale(0.98);
$scale2: scale(0.96);

.zoom-modal-container {
  &[data-l1-status="show"] {
    &[data-l2-status="hidden"] {
      animation: zoomOutModalContent $duration $animate-function forwards;
    }

    &[data-l2-status="show"] {
      animation: zoomOutModalContentL2 $duration $animate-function forwards !important;
    }

    &[data-l2-status="closing"] {
      animation: zoomInModalContentL2 $duration $animate-function forwards;
    }
  }

  &[data-l1-status="closing"] {
    animation: zoomInModalContent $duration $animate-function forwards;
  }
}

@keyframes zoomOutModalContent {
  0% {
    transform: scale(1);
  }

  100% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }
}

@keyframes zoomInModalContent {
  0% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }

  100% {
    transform: scale(1);
  }
}

@keyframes zoomOutModalContentL2 {
  0% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }

  100% {
    transform: $scale2;
    filter: $zoom-content-stage2;
  }
}

@keyframes zoomInModalContentL2 {
  0% {
    transform: $scale2;
    filter: $zoom-content-stage2;
  }

  100% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }
}
</style>

<style lang="postcss">
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
</style>

<style>
#layout.safari {
  -webkit-overflow-scrolling: touch;

  .notify-safari-something-will-change {
    will-change: transform, filter;
  }
}
</style>

<style scoped>
.parallax {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  @apply -z-10 fixed overflow-hidden;
  @apply saturate-[1.2] brightness-[40%] opacity-70;
}

.parallax__layer {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.parallax__layer img {
  display: block;
  position: absolute;
  bottom: 0;

  height: 100dvh;
  min-width: 100%;
  object-fit: cover;
}

.parallax__layer__0 {
  transform: translateY(calc(-5em * (var(--scroll))));
  @apply opacity-80;
}

/* .parallax__layer__1 {
  transform: translateY(calc(-5em * (var(--scroll) - 1)));
} */

.parallax__layer__2 {
  transform: translateY(calc(-12em * (var(--scroll) - 1)));
  @apply blur-sm;
}

.parallax__layer__3 {
  transform: translateY(calc(-18em * (var(--scroll) - 1)));
@apply blur-[1px];
}

.parallax__layer__4 {
  transform: translateY(calc(-24em * (var(--scroll) - 1)));
  @apply blur-[3px];
}

.parallax__layer__5 {
  transform: translateY(calc(-30em * (var(--scroll) - 1)));
  @apply blur-sm;
}
/* .parallax__layer__6 {
  transform: translateY(calc(-3em * (var(--scroll) - 1)));
  @apply opacity-50 blur-[2px];
} */
</style>
