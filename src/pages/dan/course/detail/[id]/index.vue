<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useSession } from '~/store/session'

// const tMode = localeKey.root.mode
// const tRule = localeKey.root.ruleset

const app = useNuxtApp()
const { t } = useI18n()
const r = useRoute('dan-course-detail-id-edit')
const session = useSession()

const course = await app.$client.dan.course.get.query(r.params.id as string)

useHead({
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
  title: course?.name ?? app.$i18n.t(localeKey.title.dan.dans.__path__),
})
</script>

<i18n lang="yaml">
en-GB:
  collection: Course
  full-name: FQDN (fully qualified dan name)
  description: Description
  requirements: Requirements
  dan: Dan
  edit: Edit
  created-at: Created at
  updated-at: Updated at
  creator: Creator
  updater: Updater
  back-to-courses: Back to Courses

zh-CN:
  collection: 组别
  full-name: 全名
  description: 描述
  requirements: 要求
  dan: 段位
  edit: 编辑
  created-at: 创建于
  updated-at: 更新于
  creator: 创建者
  updater: 更新者
  back-to-courses: 返回段位池列表

# TODO fr, DE
</i18n>

<template>
  <div class="min-h-screen bg-gbase-50 dark:bg-gbase-800">
    <div class="container px-4 mx-auto custom-container">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <div class="text-sm breadcrumbs">
          <ul>
            <li>
              <nuxt-link-locale :to="{ name: 'dan-course' }" class="link">
                {{ t('collection') }}
              </nuxt-link-locale>
            </li>
            <li>{{ course?.name }}</li>
          </ul>
        </div>
      </div>

      <!-- Hero Section -->
      <div v-if="course" class="mb-8">
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight text-gbase-900 dark:text-gbase-100">
              {{ course.name }}
            </h1>
            <p class="text-lg text-gbase-600 dark:text-gbase-300">
              {{ course.description }}
            </p>
          </div>
          <div class="flex gap-2">
            <nuxt-link-locale
              v-if="session.role.staff"
              class="btn btn-primary btn-sm btn-shadow"
              :to="{ name: 'dan-course-detail-id-edit', params: { id: course.id } }"
            >
              <Icon icon="mdi:pencil" class="w-4 h-4 mr-1" />
              {{ t('edit') }}
            </nuxt-link-locale>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-if="course" class="space-y-6">
        <!-- Metadata Card -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="space-y-4">
                <div>
                  <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
                    <Icon icon="mdi:calendar-clock" class="w-5 h-5 text-neutral" />
                    {{ t('created-at') }}
                  </h3>
                  <p class="mt-1 text-gbase-600 dark:text-gbase-300">
                    {{ course.createdAt }}
                  </p>
                </div>
                <div v-if="course.creator">
                  <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
                    <Icon icon="mdi:account" class="w-5 h-5 text-neutral" />
                    {{ t('creator') }}
                  </h3>
                  <p class="mt-1">
                    <nuxt-link-locale
                      class="link link-primary"
                      :to="{
                        name: 'user-handle',
                        params: { handle: course.creator },
                      }"
                    >
                      {{ course.creator }}
                    </nuxt-link-locale>
                  </p>
                </div>
              </div>
              <div class="space-y-4">
                <div v-if="course.updatedAt">
                  <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
                    <Icon icon="mdi:update" class="w-5 h-5 text-neutral" />
                    {{ t('updated-at') }}
                  </h3>
                  <p class="mt-1 text-gbase-600 dark:text-gbase-300">
                    {{ course.updatedAt }}
                  </p>
                </div>
                <div v-if="course.updater">
                  <h3 class="flex items-center gap-2 text-lg font-semibold text-gbase-900 dark:text-gbase-100">
                    <Icon icon="mdi:account-edit" class="w-5 h-5 text-neutral" />
                    {{ t('updater') }}
                  </h3>
                  <p class="mt-1">
                    <nuxt-link-locale
                      class="link link-primary"
                      :to="{
                        name: 'user-handle',
                        params: { handle: course.updater },
                      }"
                    >
                      {{ course.updater }}
                    </nuxt-link-locale>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dans Table -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="flex items-center gap-2 text-xl font-semibold text-gbase-900 dark:text-gbase-100">
              <Icon icon="mdi:format-list-bulleted" class="w-5 h-5 text-neutral" />
              {{ t('dan') }}
            </h2>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th class="w-1/4 text-gbase-900 dark:text-gbase-100">
                      {{ t('dan') }}
                    </th>
                    <th class="text-gbase-900 dark:text-gbase-100">
                      {{ t('full-name') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dan in course.dans" :key="dan.id" class="hover:bg-base-200">
                    <td>
                      <nuxt-link-locale
                        :to="{
                          name: 'dan-detail-id',
                          params: { id: dan.id },
                        }"
                        class="font-bold link"
                      >
                        {{ dan.shortName }}
                      </nuxt-link-locale>
                    </td>
                    <td>
                      <div class="whitespace-pre text-gbase-600 dark:text-gbase-300">
                        {{ dan.name }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
