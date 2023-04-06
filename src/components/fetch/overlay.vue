<script>
export default {
  name: 'LoadingOverlay',
  props: {
    fetching: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<template>
  <transition
    enter-active-class="transition ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-show="fetching"
      class="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full pointer-events-none bg-base-200 backdrop-filter bg-opacity-20 backdrop-blur-sm"
    >
      <svg
        class="w-12 h-12 text-kimberly-900 dark:text-kimberly-100 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  </transition>
</template>
