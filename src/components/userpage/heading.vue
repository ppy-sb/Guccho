<script setup lang="ts">
import { faEnvelope, faHeart, faHeartCrack, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import type { Ref } from 'vue'
import { inject, ref } from 'vue'
import { useElementHover } from '@vueuse/core'
import { useNuxtApp } from '#app'
import { useFAIconLib } from '#imports'
import type { UserFull as User } from '~/types/user'
import { useSession } from '~/store/session'

import type { Id } from '~/server/trpc/config'
import type { SwitcherComposableType } from '~/composables/useSwitcher'

const { addToLibrary } = useFAIconLib()
addToLibrary(faUserGroup, faHeartCrack, faHeart, faEnvelope)

const { $client } = useNuxtApp()
const session = useSession()
const changeFriendStateButton = ref(null)
const [switcher, setSwitcher] = inject('switcher') as SwitcherComposableType
const user = inject<Ref<User<Id>>>('user')
const {
  data,
  refresh,
} = await useAsyncData(async () => {
  const relationWithMe = (session.loggedIn && $client.me.relation.query({
    target: user?.value.id as Id,
  })) || undefined
  const friendCount = $client.user.countRelations.query({
    handle: user?.value.id as Id,
    type: 'friend',
  })
  return {
    relationWithMe: await relationWithMe,
    friendCount: await friendCount,
  }
})
const isMutualFriend = computed(() => data.value?.relationWithMe?.mutual?.includes('mutual-friend') || false)
const isFriendButtonHovered = useElementHover(changeFriendStateButton)
const friendButtonContent = computed(() => data.value?.friendCount || 'Add as friend')
const toggleFriend = async () => {
  if (!session.loggedIn)
    return
  const input = { type: 'friend', target: user?.value.id as Id } as const
  if (isMutualFriend.value)
    await $client.me.removeOneRelation.mutate(input)
  else
    await $client.me.addOneRelation.mutate(input)

  refresh()
}
</script>

<template>
  <section
    v-if="user"
    class="flex flex-col items-center w-full gap-5 mx-auto mt-5 md:container custom-container md:mt-20 md:flex-row md:items-end root"
  >
    <!-- Logo -->
    <div>
      <img
        :src="user.avatarUrl"
        class="mask mask-squircle"
        width="300"
      >
    </div>
    <!-- info -->
    <div class="flex flex-col w-full pt-4 md:p-0 bg-kimberly-200 dark:bg-kimberly-700 md:bg-transparent md:grow">
      <div
        v-if="session.$state.userId !== user.id"
        class="container flex justify-around order-3 gap-3 pb-4 mx-auto md:order-1 md:justify-end md:pb-0"
      >
        <t-button
          ref="changeFriendStateButton"
          size="sm"
          :variant="isMutualFriend ? 'primary' : 'neutral'"
          class="gap-1"
          @click="toggleFriend"
        >
          <font-awesome-icon
            :icon="isFriendButtonHovered && isMutualFriend ? 'fas fa-heart-crack' : 'fas fa-heart'"
            :class="{
              'fa-bounce': isFriendButtonHovered,
            }"
          />
          <span>{{ friendButtonContent }}</span>
        </t-button>
        <t-button
          v-if="session.$state.loggedIn"
          size="sm"
          variant="secondary"
          class="gap-1"
        >
          <font-awesome-icon icon="fas fa-envelope" />
          <span>send message</span>
        </t-button>
      </div>
      <div
        v-else
        class="container flex justify-around order-3 gap-3 pb-4 mx-auto md:order-1 md:justify-end md:pb-0"
      >
        <t-button
          size="sm"
          variant="primary"
        >
          add as friend
        </t-button>
        <t-nuxt-link-button
          size="sm"
          variant="accent"
          :to="{
            name: 'me-preferences',
          }"
        >
          change preferences
        </t-nuxt-link-button>
      </div>
      <div class="container mx-auto sm:order-2 sm:flex sm:gap-1 sm:items-end sm:justify-between md:pb-2">
        <div>
          <div>
            <h1 class="text-5xl items-center md:items-left flex flex-col md:flex-row gap-1">
              {{ user.name }}
              <div class="flex flex-row gap-1 md:self-end">
                <div
                  v-for="role in user.roles.filter(role => !['normal', 'registered'].includes(role))"
                  :key="role"
                  class="badge"
                >
                  {{ role }}
                </div>
              </div>
            </h1>
            <h2
              class="text-3xl text-center underline md:text-left decoration-sky-500 text-kimberly-600 dark:text-kimberly-300"
            >
              @{{ user.safeName }}
            </h2>
            <div class="pb-2" />
          </div>
        </div>
        <div class="div">
          <app-mode-switcher :model-value="switcher" class="self-end" @update:model-value="setSwitcher" />
        </div>
      </div>
      <div class="order-3 user-status">
        currently offline.
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.user-status {
  @apply text-center text-kimberly-600 dark:text-kimberly-400 bg-kimberly-200/50 dark:bg-kimberly-700/50 px-2;
  @apply md:text-left md:rounded;
  @apply md:[margin-left:-7em] md:[padding-left:7em];
}
</style>
