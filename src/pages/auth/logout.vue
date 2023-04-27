<script lang="ts">
import { useSession } from '~/store/session'

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
  <div class="self-center h-[100dvh] flex items-center text-lg">
    Logging out...
  </div>
</template>
