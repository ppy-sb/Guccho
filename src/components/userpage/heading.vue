<script setup lang="ts">
import {
  faEnvelope,
  faHeart,
  faHeartCrack,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import type { Ref } from 'vue'

import { useElementHover } from '@vueuse/core'

import type { UserFull as User } from '~/types/user'
import { useSession } from '~/store/session'

import type { LeaderboardSwitcherComposableType } from '~/composables/useSwitcher'

const { addToLibrary } = useFAIconLib()
addToLibrary(faUserGroup, faHeartCrack, faHeart, faEnvelope)

const hasBeatmap = ['playing', 'modding', 'multiplaying', 'editing', 'watching', 'testing', 'submitting']
const { $client } = useNuxtApp()
const session = useSession()
const changeFriendStateButton = ref(null)
const [switcher, setSwitcher] = inject(
  'switcher',
) as LeaderboardSwitcherComposableType
const user = inject<Ref<User<string>>>('user')
const { data, refresh } = await useAsyncData(async () => {
  if (!user?.value) {
    return {}
  }
  const relationWithMe
    = (session.loggedIn
      && $client.me.relation.query({
        target: user.value.id,
      }))
    || undefined
  const friendCount = $client.user.countRelations.query({
    handle: user.value.id,
    type: 'friend',
  })
  return {
    relationWithMe: await relationWithMe,
    friendCount: await friendCount,
  }
})
const { data: live, refresh: reloadLiveData } = await useAsyncData(async () =>
  user?.value?.id ? await $client.user.status.query({ id: user.value.id }) : null,
)
onMounted(() => {
  onBeforeUnmount(() => clearInterval(setInterval(() => reloadLiveData(), 5000)))
})
const isMutualFriend = computed(
  () => data.value?.relationWithMe?.mutual?.includes('mutual-friend') || false,
)
const isFriend = computed(() =>
  data.value?.relationWithMe?.self.includes('friend'),
)
const isFriendButtonHovered = useElementHover(changeFriendStateButton)
const friendButtonContent = computed(
  () => data.value?.friendCount || 'Add as friend',
)
const toggleFriend = async () => {
  if (!session.loggedIn) {
    return
  }
  if (!user?.value) {
    return
  }
  const input = { type: 'friend', target: user.value.id } as const
  if (isFriend.value) {
    await $client.me.removeOneRelation.mutate(input)
  }
  else {
    await $client.me.addOneRelation.mutate(input)
  }

  refresh()
}
</script>

<template>
  <section
    v-if="user"
    class="flex flex-col items-center w-full gap-5 mx-auto mt-2 md:container custom-container md:mt-24 md:flex-row md:items-end root"
  >
    <!-- Logo -->
    <div>
      <div
        :style="`background-image: url(${user.avatarSrc}?${Date.now()}); background-position: center`"
        class="mask mask-squircle w-[150px] md:w-[300px] bg-cover aspect-square"
      />
    </div>
    <!-- info -->
    <div
      class="flex flex-col w-full pt-2 md:p-0 bg-kimberly-200 dark:bg-kimberly-700 md:bg-transparent md:grow"
    >
      <div
        v-if="session.$state.userId !== user.id"
        class="container flex justify-around order-3 gap-3 pb-2 mx-auto md:order-1 md:justify-end md:pb-0"
      >
        <t-button
          ref="changeFriendStateButton"
          size="sm"
          :variant="isMutualFriend ? 'primary' : 'neutral'"
          class="gap-1"
          @click="toggleFriend"
        >
          <font-awesome-icon
            :icon="
              isFriendButtonHovered && isMutualFriend
                ? 'fas fa-heart-crack'
                : 'fas fa-heart'
            "
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
        <!-- <t-button
          size="sm"
          variant="primary"
        >
          add as friend
        </t-button> -->
        <t-nuxt-link-button
          size="sm"
          variant="accent"
          :to="{
            name: 'me-settings',
          }"
        >
          Edit
        </t-nuxt-link-button>
      </div>
      <div
        class="container flex flex-col flex-wrap gap-8 mx-auto md:flex-row md:gap-4 lg:gap-0 sm:order-2 md:items-end md:justify-between md:pb-2"
      >
        <div class="order-2 mx-10 sm:mx-32 md:mx-0 md:order-1 lg:order-2 md:ml-auto md:pt-4 lg:py-2">
          <app-mode-switcher
            :model-value="switcher"
            class="self-start"
            @update:model-value="setSwitcher"
          />
        </div>
        <div class="order-1 md:order-2 lg:order-1">
          <h1
            class="flex flex-col items-center gap-1 pb-1 text-5xl xl:text-6xl md:items-left md:flex-row"
            :class="useUserRoleColor(user)"
          >
            {{ user.name }}
          </h1>
          <nuxt-link
            :to="{ name: 'user-handle', params: { handle: `@${user.safeName}` } }"
            class="text-3xl text-center underline md:text-left decoration-sky-500 text-kimberly-600 dark:text-kimberly-300"
          >
            @{{ user.safeName }}
          </nuxt-link>
          <div class="lg:pb-2" />
        </div>
      </div>
      <template v-if="live">
        <div v-if="live.status === 'offline'" class="order-3 user-status">
          currently offline, last seen at {{ live.lastSeen.toLocaleString() }}
        </div>
        <div v-else-if="live && hasBeatmap.includes(live.status)" class="order-3 user-status">
          {{ live.status }} {{ live.beatmap?.beatmapset.meta.intl.artist }} - {{ live.beatmap?.beatmapset.meta.intl.title }} [{{ live.beatmap?.version }}]
        </div>
        <div v-else-if="live.status === 'idle'" class="order-3 user-status">
          currently online.
        </div>
        <div v-else-if="live.status === 'afk'" class="order-3 user-status">
          afk
        </div>
      </template>
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
