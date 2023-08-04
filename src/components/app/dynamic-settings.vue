<script setup lang="ts">
import type { ExtractSettingType } from '$base/define-setting'
import { extractSettingLocales } from '$base/define-setting'

const props = defineProps<{
  modelValue: ExtractSettingType<typeof settings>
  unchanged: ExtractSettingType<typeof settings>
}>()
const { settings } = useAdapterConfig()
const messages = extractSettingLocales(settings)
const { t } = useI18n({
  messages,
})
const model = defineModel<ExtractSettingType<typeof settings>>()
</script>

<i18n lang="yaml">
en-GB:
  stored-at:
    0: Saved Locally
    1: Saved on server
</i18n>

<template>
  <div v-for="(setting, key) in settings" :key="setting.label">
    <template v-if="model">
      <label class="label" :for="setting.label">
        <span class="pl-3 label-text">{{ t(setting.label) }}</span>
        <span class="font-light text-sm">{{ t(`stored-at.${setting.store}`) }}</span>
      </label>
      <div class="flex gap-4">
        <input
          v-if="setting.type === 'input'"
          :id="setting.label"
          v-model="model[key]"
          :placeholder="setting.label"
          :disabled="setting.disabled"
          class="input input-sm grow blur-sm hover:blur-none"
          :class="{
            'input-bordered input-primary':
              props.unchanged[key] !== model[key],
            '!input-ghost border-none':
              props.unchanged[key] === model[key] || setting.disabled,
          }"
        >
        <select v-else-if="setting.type === 'select'" id="" v-model="model[key]" :disabled="setting.disabled" class="select select-ghost w-full select-sm" :name="setting.label">
          <option v-for="option in setting.options" :key="setting.label + option.label" :disabled="option.disabled" :value="option.value" :selected="model[key] === option.value">
            {{ t(option.label) }}
          </option>
        </select>
      </div>
    </template>
  </div>
</template>

<style lang="postcss">
.label-text {
  @apply font-semibold;
}
</style>
