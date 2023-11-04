<script setup lang="ts">
// select-lg
// select-md
// select-sm
// select-xs
import { Float } from '@headlessui-float/vue'
import {
  Listbox,
  ListboxButton,
  // ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import type { HTMLAttributes } from 'vue'

interface Option {
  label: string | number
  value: unknown
  disabled?: boolean
  attrs?: HTMLAttributes
}
const props = defineProps<{
  size?: 'xs' | 'sm' | 'lg'
  options: Option[]
  modelValue?: Option['value'][]
}>()
const e = defineEmits<{
  (e: 'update:modelValue', value: Option[]): void
}>()
function reset() {
  return props.modelValue?.map((v: unknown) => props.options.find(opt => opt.value === v)).filter(TSFilter) || []
}
const select = computed(() => reset())
</script>

<template>
  <Listbox :model-value="select" multiple @update:model-value="(value) => e('update:modelValue', value.map((v: Option) => v.value))">
    <client-only>
      <Float :offset="4" portal>
        <ListboxButton class="select h-full w-full" :class="[props.size && `select-${props.size}`]">
          <div v-if="select.length" class="flex gap-1 flex-wrap self-center">
            <span v-for="s in select" :key="s.label" class="badge whitespace-nowrap" v-bind="s.attrs">
              {{ s.label }}
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
            class="z-50 mt-1 menu menu-compact bg-base-100/80 backdrop-blur shadow"
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
      </Float>
    </client-only>
  </Listbox>
</template>
