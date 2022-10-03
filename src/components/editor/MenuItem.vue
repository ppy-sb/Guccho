<template>
  <button
    :class="{ 'is-active': isActive ? isActive(): null }"
    :title="title"
    @click="action"
  >
    <svg class="remix">
      <use :xlink:href="`${remixiconUrl}#ri-${icon}`" />
    </svg>
  </button>
</template>

<script>
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'

export default {
  props: {
    icon: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    action: {
      type: Function,
      required: true
    },

    isActive: {
      type: Function,
      default: null
    }
  },

  data () {
    return {
      remixiconUrl
    }
  }
}
</script>
