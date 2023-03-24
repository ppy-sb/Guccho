<script lang="ts">
// @ts-expect-error string
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import type { PropType } from 'vue'

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    action: {
      type: Function as PropType<() => any>,
      required: true,
    },

    isActive: {
      type: Function as PropType<() => boolean>,
      default: null,
    },
  },

  data() {
    return {
      remixiconUrl,
    }
  },
})
</script>

<template>
  <button
    :class="{ 'is-active': isActive ? isActive() : null }"
    :title="title"
    @click="action"
  >
    <svg class="remix">
      <use :xlink:href="`${remixiconUrl}#ri-${icon}`" />
    </svg>
  </button>
</template>
