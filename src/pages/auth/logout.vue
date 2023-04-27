<script lang="ts">
import { useSession } from '../../store/session'

export default {
  name: 'Logout',
  setup() {
    const $router = useRouter()
    const session = useSession()
    onMounted(() => {
      session.destroy()
      $router.push('/')
    })
  },
}
</script>
