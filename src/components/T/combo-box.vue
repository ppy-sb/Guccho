<script setup lang="ts" generic="T extends string | number | symbol">
import { computed, ref } from 'vue'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  TransitionRoot,
} from '@headlessui/vue'

// import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

interface Option {
  value: T
  label: string
}
const props = defineProps<{
  options: Option[]
  modelValue: T
}>()

const selected = ref(props.options.find(opt => opt.value === props.modelValue))

const query = ref('')

const filtered = computed(() =>
  query.value === ''
    ? props.options
    : props.options.filter(person =>
      person.label
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(query.value.toLowerCase().replace(/\s+/g, ''))
    )
)
</script>

<template>
  <Combobox v-model="selected" class="z-40">
    <div class="relative mt-1">
      <ComboboxInput
        class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
        :display-value="(value) => (value as Option)?.label"
        @change="query = $event.target.value"
      />
      <ComboboxButton
        class="absolute inset-y-0 right-0 flex items-center pr-2"
      >
        <ChevronUpDownIcon
          class="h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
      </ComboboxButton>
      <TransitionRoot
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <div
            v-if="filtered.length === 0 && query !== ''"
            class="relative cursor-default select-none py-2 px-4 text-gray-700"
          >
            Nothing found.
          </div>

          <ComboboxOption
            v-for="entry in filtered"
            :key="entry.value"
            v-slot="{ selected, active }"
            as="template"
            :value="entry"
          >
            <li
              class="relative cursor-default select-none py-2 pl-10 pr-4"
              :class="{
                'bg-teal-600 text-white': active,
                'text-gray-900': !active,
              }"
            >
              <span
                class="block truncate"
                :class="{ 'font-medium': selected, 'font-normal': !selected }"
              >
                {{ entry.label }}
              </span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-3"
                :class="{ 'text-white': active, 'text-teal-600': !active }"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </div>
  </Combobox>
</template>
