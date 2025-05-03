<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  id?: string
  updatedAt?: Date
  updater?: string
  createdAt?: Date
  creator?: string
}>()

const title = defineModel<string>('title')
const description = defineModel<string>('description')

const { t } = useI18n()
</script>

<template>
  <div>
    <div class="flex items-center gap-4 mb-4">
      <h1 class="text-2xl font-bold w-full">
        <div class="form-control">
          <input
            v-model="title"
            class="input input-bordered input-lg text-2xl font-bold"
            :placeholder="t('name')"
          >
        </div>
      </h1>
    </div>

    <div class="form-control">
      <textarea
        v-model="description"
        class="textarea textarea-bordered"
        rows="5"
        :placeholder="t('description')"
      />
    </div>

    <div v-if="id" class="py-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-4">
          <div v-if="createdAt">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
              <Icon icon="mdi:calendar-clock" class="w-5 h-5 text-neutral" />
              {{ t('created-at') }}
            </h3>
            <p class="mt-1 text-gbase-600 dark:text-gbase-300">
              {{ createdAt }}
            </p>
          </div>
          <div v-if="creator">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
              <Icon icon="mdi:account" class="w-5 h-5 text-neutral" />
              {{ t('creator') }}
            </h3>
            <p class="mt-1">
              <nuxt-link-locale
                class="link link-primary"
                :to="{
                  name: 'user-handle',
                  params: { handle: creator },
                }"
              >
                {{ creator }}
              </nuxt-link-locale>
            </p>
          </div>
        </div>
        <div class="space-y-4">
          <div v-if="updatedAt">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
              <Icon icon="mdi:calendar-clock" class="w-5 h-5 text-neutral" />
              {{ t('updated-at') }}
            </h3>
            <p class="mt-1 text-gbase-600 dark:text-gbase-300">
              {{ updatedAt }}
            </p>
          </div>
          <div v-if="updater">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
              <Icon icon="mdi:account" class="w-5 h-5 text-neutral" />
              {{ t('updater') }}
            </h3>
            <p class="mt-1">
              <nuxt-link-locale
                class="link link-primary"
                :to="{
                  name: 'user-handle',
                  params: { handle: updater },
                }"
              >
                {{ updater }}
              </nuxt-link-locale>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en-GB:
  name: Name
  description: Description
  created-at: Created at
  creator: Creator
  updated-at: Updated at
  updater: Updater

zh-CN:
  name: 名称
  description: 描述
  created-at: 创建时间
  creator: 创建者
  updated-at: 更新时间
  updater: 更新者
</i18n>
