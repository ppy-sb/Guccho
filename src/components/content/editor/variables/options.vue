<script>
const { variables: template } = useEditorVariables()

export default {
  props: {
    command: {
      type: Function,
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
    }
  },
  computed: {
    availableOptions() {
      return [...template.entries()].filter(([k]) => k.toLowerCase().includes(this.query.toLowerCase())).map(([_k, v]) => ({
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
    onKeyDown({ event }) {
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
    selectItem(selectedIndex) {
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
  <ul class="menu bg-base-100 w-max rounded-box">
    <li v-for="(option, index) in availableOptions" :key="index" class="whitespace-nowrap" :class="{ 'bg-base-200': selectedIndex === index }" @click="selectItem(index)">
      <div class="flex flex-col items-start">
        <div class="flex gap-2">
          <strong>{{ option.name }}</strong>
          <span class="text-muted">{{ option.value }} | {{ option.fallback }}</span>
        </div>
        <em class="text-sm">{{ option.description }}</em>
      </div>
    </li>
  </ul>
</template>
