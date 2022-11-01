<template>
  <section
    v-if="user"
    class="flex flex-col items-center w-full gap-5 mx-auto mt-5 md:container custom-container md:mt-20 md:flex-row md:items-end root"
  >
    <!-- Logo -->
    <div>
      <img :src="user.avatarUrl" class="mask mask-squircle" width="300">
    </div>
    <!-- info -->
    <div class="flex flex-col w-full pt-4 md:p-0 bg-kimberly-200 dark:bg-kimberly-700 md:bg-transparent md:grow">
      <div
        v-if="session.userId !== user.id"
        class="container flex justify-around order-3 gap-3 pb-4 mx-auto md:order-1 md:justify-end md:pb-0"
      >
        <t-button ref="changeFriendStateButton" size="sm" :variant="isMutualFriend ? 'primary' : 'neutral'" class="gap-1">
          <client-only>
            <font-awesome-icon
              :icon="isFriendButtonHovered && isMutualFriend ? 'fas fa-heart-crack' : 'fas fa-heart'"
              :class="{
                'fa-bounce': isFriendButtonHovered
              }"
            />
          </client-only>
          <span>{{ friendButtonContent }}</span>
        </t-button>
        <t-button v-if="session.loggedIn" size="sm" variant="secondary" class="gap-1">
          <font-awesome-icon icon="fas fa-envelope" />
          <span>send message</span>
        </t-button>
      </div>
      <div v-else class="container flex justify-around order-3 gap-3 pb-4 mx-auto md:order-1 md:justify-end md:pb-0">
        <t-button size="sm" variant="primary">
          add as friend
        </t-button>
        <t-nuxt-link-button
          size="sm"
          variant="accent"
          :to="{
            name: 'me-preferences'
          }"
        >
          change preferences
        </t-nuxt-link-button>
      </div>
      <div class="container mx-auto sm:order-2 sm:flex sm:gap-1 sm:items-end sm:justify-between md:pb-2">
        <div>
          <div>
            <h1 class="text-5xl text-center md:text-left">
              {{ user.name }}
            </h1>
            <h2
              class="text-3xl text-center underline md:text-left decoration-sky-500 text-kimberly-600 dark:text-kimberly-300"
            >
              @{{ user.safeName }}
            </h2>
            <div class="pb-2" />
          </div>
        </div>
        <app-mode-switcher class="self-end" />
      </div>
      <div class="order-3 user-status">
        currently offline.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { faUserGroup, faHeartCrack, faHeart, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { inject, ref, Ref } from 'vue'
import { useElementHover } from '@vueuse/core'
import { useClient, useFAIconLib } from '#imports'
import { User } from '~/prototyping/types/user'
import { useSession } from '~/store/session'

import type { IdType } from '~/server/trpc'

const changeFriendStateButton = ref(null)
const session = useSession()
const client = useClient()
const { addToLibrary } = useFAIconLib()
addToLibrary(faUserGroup, faHeartCrack, faHeart, faEnvelope)

const user = inject<Ref<User<IdType>>>('user')
const userFriendCount = await client.query('user.count-friends', {
  handle: user?.value.id as IdType
})
const relationWithSessionUser = session.loggedIn
  ? await client.query('user.relation', {
    from: user?.value.id as IdType,
    target: session.userId as IdType
  })
  : undefined

const isMutualFriend = ref(relationWithSessionUser?.mutual.includes('mutual-friend') || false)
const isFriendButtonHovered = useElementHover(changeFriendStateButton)
const friendButtonContent = ref<string | number>(userFriendCount || 0)

</script>

<style scoped lang="scss">
.user-status {
  @apply text-center text-kimberly-600 dark:text-kimberly-400 bg-kimberly-200/50 dark:bg-kimberly-700/50 px-2;
  @apply md:text-left md:rounded;
  @apply md:[margin-left:-7em] md:[padding-left:7em];
}
</style>
