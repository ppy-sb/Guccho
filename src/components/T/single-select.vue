<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  // ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'

interface Option {
  label: string | number
  value: unknown
  disabled?: boolean
}
const props = defineProps<{
  size?: 'xs' | 'sm' | 'lg'
  options: Option[]
  modelValue?: Option['value']
}>()
const e = defineEmits<{
  (e: 'update:modelValue', value: Option['value']): void
}>()

const selected = computed(() => props.options.find((value) => {
  return value.value === props.modelValue
}))
const root = ref<InstanceType<typeof Listbox>>()
defineExpose({
  root,
})
</script>

<template>
  <Listbox ref="root" :model-value="selected" @update:model-value="(value) => e('update:modelValue', value) ">
    <div class="relative">
      <ListboxButton class="select" :class="[props.size && `select-${props.size}`]">
        <div v-if="selected" class="flex gap-3">
          <span selected class="_item">
            {{ selected.label }}
          </span>
        </div>
        <span v-else>select</span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-50 mt-1 menu menu-compact bg-gbase-100/80 backdrop-blur shadow"
          :class="[
            props.size === 'sm' || props.size === 'xs' ? 'rounded-xl' : 'rounded-box',
          ]"
        >
          <ListboxOption
            v-for="option in props.options"
            v-slot="{ selected }"
            :key="option.label"
            :value="option"
            as="template"
            :disabled="option.disabled"
          >
            <li>
              <span
                class="block truncate" :class="[
                  selected ? 'active' : '',
                ]"
              >{{ option.label }}</span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
