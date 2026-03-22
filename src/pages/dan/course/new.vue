<script setup lang="ts">
import { Icon } from '@iconify/vue'

definePageMeta({
  middleware: ['auth', 'bn'],
})

const app = useNuxtApp()
const router = useRouter()
const { t } = useI18n()

useHead({
  title: app.$i18n.t(localeKey.title.dan.dans.__path__),
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
})

const course = ref({
  name: '',
  description: '',
})

const loading = ref(false)
const error = ref<Error>()

async function handleCreate() {
  loading.value = true
  error.value = undefined
  try {
    const id = await app.$client.dan.course.create.mutate({
      name: course.value.name,
      description: course.value.description,
    })
    router.push({
      name: 'dan-course-detail-id-edit',
      params: {
        id,
      },
    })
  }
  catch (e: any) {
    error.value = e
  }
  finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push('/dan/course/manage')
}
</script>

<i18n lang="yaml">
en-GB:
  create-course: Create Course
  back: Back

zh-CN:
  create-course: 创建段位池
  back: 返回
</i18n>

<template>
  <section class="container px-2 mx-auto custom-container space-y-4">
    <div class="flex items-center gap-4">
      <button class="btn btn-ghost" @click="handleCancel">
        <Icon icon="mdi:arrow-left" class="w-4 h-4" />
        {{ t('back') }}
      </button>
      <h1 class="text-lg">
        {{ t('create-course') }}
      </h1>
    </div>
    <dan-course-form-header
      v-model:title="course.name"
      v-model:description="course.description"
    />

    <button class="btn btn-primary" :disabled="loading" @click="handleCreate">
      <span v-if="loading" class="loading loading-spinner loading-xs mr-2" />
      {{ t('create-course') }}
    </button>
    <div v-if="error" class="text-error mt-2">
      {{ formatGucchoErrorWithT(t, error) }}
    </div>
  </section>
</template>
