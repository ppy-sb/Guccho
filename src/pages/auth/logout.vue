<script lang="ts" setup>
// old is '~/store/session'
import { useSession } from '~/store/session'

definePageMeta ({
  layout: 'hero',
})
const $router = useRouter()
const session = useSession()
const { t } = useI18n()
onMounted(async () => {
  await session.destroy()
  setTimeout(() => $router.push('/'), 1000)
})
</script>

<i18n lang="yaml">
en-GB:
  logging-out: Logging out...

zh-CN:
  logging-out: 正在登出...
</i18n>

<template>
  <div class="text-lg">
    {{ t('logging-out') }}
  </div>
</template>
