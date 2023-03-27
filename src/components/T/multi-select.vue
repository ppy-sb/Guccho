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
  value: any
  disabled: boolean
}
const props = defineProps<{
  size?: 'xs' | 'sm' | 'lg'
  options: Option[]
  modelValue?: Option['value']
}>()
const e = defineEmits<{
  (e: 'update:modelValue', value: Option): void
}>()
const reset = () => props.modelValue?.map((v: any) => props.options.find(opt => opt.value === v))
const selected = ref(reset() || [])
watch(() => props.modelValue, () => {
  selected.value = props.modelValue?.map((v: any) => props.options.find(opt => opt.value === v)) || []
})
</script>

<template>
  <Listbox v-model="selected" multiple @update:model-value="(value) => e('update:modelValue', value.map((v: Option) => v.value))">
    <div class="relative">
      <ListboxButton class="select" :class="[props.size && `select-${props.size}`]">
        <div v-if="selected.length" class="flex gap-2">
          <span v-for="s in selected" :key="s.label" selected class="_item">
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
          class="absolute z-50 mt-2 menu menu-compact bg-base-100/80 backdrop-blur"
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

<style lang="scss" scoped>
._item + ._item{
  &::before {
    content: '';
    position: absolute;
    top: 30%;
    bottom: 20%;
    margin-left: -0.3rem;
    @apply border-l-2 border-kimberly-500
  }
}
</style>
