<template>
  <VTooltip delay="{ show: 500, hide: 100 }" placement="right">
    <nuxt-link :to="href">
      {{ user.name }}
    </nuxt-link>

    <template #popper>
      <div
        class="relative overflow-hidden rounded-lg px-3 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white w-min-[16rem]"
      >
        <div v-if="user">
          <div class="flex gap-2 items-center">
            <img
              :src="`https://a.${$config.baseUrl}/${user.player_id}`"
              alt=""
              class="w-16 h-16 rounded-lg"
            >
            <div>
              <h1 class="text-xl">
                {{ user.name }}
              </h1>
              <h1>
                <img class="h-6 w-auto" :src="$getFlagURL(user.country)">
              </h1>
            </div>
          </div>
        </div>
      </div>
    </template>
  </VTooltip>
</template>

<script>
// const runtimeConfig = useRuntimeConfig()
export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      required: true
    },
    href: {
      type: String,
      required: false,
      default: '/'
    }
  },
  data () {
    return {
      user_status: null,
      fetching: true
    }
  }
}
</script>
