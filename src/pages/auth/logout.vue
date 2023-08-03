<script lang="ts" setup>
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
</i18n>

<template>
  <div class="text-lg">
    {{ t('logging-out') }}
  </div>
</template>
