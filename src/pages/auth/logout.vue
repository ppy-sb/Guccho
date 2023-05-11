<script lang="ts">
import { useSession } from '~/store/session'

definePageMeta({
  layout: 'hero',
})
export default {
  name: 'Logout',
  setup() {
    const $router = useRouter()
    const session = useSession()
    onMounted(async () => {
      await session.destroy()
      setTimeout(() => $router.push('/'), 1000)
    })
  },
}
</script>

<template>
  <div class="text-lg">
    Logging out...
  </div>
</template>
