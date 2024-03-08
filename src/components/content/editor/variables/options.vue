<script lang="ts">
export default {
  props: {
    command: {
      type: Function as unknown as () => (tmp: { name: string }) => void,
      required: true,
    },
    query: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      selectedIndex: 0,
      template: useEditorVariables({ i18n: useI18n() }).variables,
    }
  },
  computed: {
    availableOptions() {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      return [...this.template.entries()].filter(([k]) => k.toLowerCase().includes(this.query?.toLowerCase()!)).map(([_k, v]) => ({
        ...v,
        name: _k,
      }))
    },
  },
  watch: {
    query() {
      this.selectedIndex = 0
    },
  },
  methods: {
    onKeyDown({ event }: { event: KeyboardEvent }) {
      switch (event.key) {
        case 'ArrowUp':
          this.selectedIndex = ((this.selectedIndex + this.availableOptions.length) - 1) % this.availableOptions.length
          return true
        case 'ArrowDown':
          this.selectedIndex = (this.selectedIndex + 1) % this.availableOptions.length
          return true
        case 'Enter':
        case 'Tab':
          this.selectItem(this.selectedIndex)
          return true
      }

      return false
    },
    selectItem(selectedIndex: number) {
      const variable = this.availableOptions[selectedIndex]
      if (!variable) {
        return
      }
      this.command({ name: variable.name })
    },
  },
}
</script>

<template>
  <ul class="menu bg-base-100 w-max rounded-box space-y-1">
    <li
      v-for="(option, index) in availableOptions" :key="index"
      class="whitespace-nowrap"
      @click="selectItem(index)"
    >
      <div
        class="inline-block"
        :class="{ 'bg-base-200': selectedIndex === index }"
      >
        <div class="space-x-2">
          <strong>{{ option.name }}</strong>
          <span v-if="option.t" class="text-muted">{{ $t(option.name) }}</span>
          <span v-else class="text-muted">{{ option.value }} | {{ option.fallback }}</span>
        </div>
        <em class="text-sm">{{ option.description }}</em>
      </div>
    </li>
  </ul>
</template>
