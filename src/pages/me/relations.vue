<script setup lang="ts">
import { useSession } from '~/store/session'
import type { UserRelationship } from '~/types/user-relationship'
import type { Relationship } from '~/types/common'

const app$ = useNuxtApp()
const session = useSession()

if (!session.$state.loggedIn) {
  await navigateTo({
    name: 'auth-login',
    query: {
      back: '1',
    },
  })
}
const relations = ref(await app$.$client.me.relations.query())
const config = useAppConfig()

useHead({
  titleTemplate: `Friends - ${config.title}`,
})
if (!relations.value) {
  throw new Error('user not exists')
}

const errorMessage = ref('')

onErrorCaptured((err) => {
  errorMessage.value = err.message || 'something went wrong.'
})
function haveRelation(relation: Relationship, user: UserRelationship<string>) {
  return user.relationship.includes(relation)
}
const pendingUser = reactive(new Set<string>())
async function toggleRelation(type: Relationship, user: UserRelationship<string>) {
  pendingUser.add(user.id)
  try {
    if (haveRelation(type, user)) {
      await app$.$client.me.removeOneRelation.mutate({ type, target: user.id })
      user.relationship = user.relationship.filter(k => k !== type)
    }
    else {
      await app$.$client.me.addOneRelation.mutate({ type, target: user.id })
      user.relationship.push(type)
    }
    pendingUser.delete(user.id)
  }
  catch (e) {
    pendingUser.delete(user.id)
  }
}

const toggleFriend = toggleRelation.bind(null, 'friend')
const isFriend = haveRelation.bind(null, 'friend')
const toggleBlock = toggleRelation.bind(null, 'block')
const isBlocked = haveRelation.bind(null, 'block')
</script>

<template>
  <div class="container pt-24 mx-auto custom-container">
    <suspense>
      <template #fallback>
        <div>
          {{ errorMessage || "Loading..." }}
        </div>
      </template>
      <div class="mx-auto user-list">
        <div
          v-for="user in relations"
          :key="`relation-@${user.safeName}`"
          class="w-full p-2 user-list-item"
        >
          <div
            class="flex items-center justify-center gap-2 md:justify-start face"
          >
            <div class="relative z-10 mask mask-squircle hoverable">
              <img
                :src="user.avatarSrc"
                class="pointer-events-none w-14 md:w-[4em]"
              >
            </div>
            <div class="grow">
              <h1 class="text-2xl text-left md:text-3xl">
                {{ user.name }}
              </h1>
              <div class="flex justify-between w-full items-top">
                <nuxt-link
                  :key="`${user.id}:${user.relationship.join('-')}`"
                  class="text-lg text-left underline md:text-2xl decoration-sky-500 text-gbase-600 dark:text-gbase-300 hover:text-gbase-500"
                  :to="{
                    name: 'user-handle',
                    params: {
                      handle: `@${user.safeName}`,
                    },
                  }"
                >
                  @{{ user.safeName }}
                </nuxt-link>
                <div class="flex gap-2 actions">
                  <!-- <t-button variant="info" size="xs" class="md:btn-sm">
                    chat
                  </t-button> -->
                  <t-button :loading="pendingUser.has(user.id)" variant="warning" size="xs" class="md:btn-sm" @click="toggleFriend(user)">
                    {{ pendingUser.has(user.id) ? '' : isFriend(user) ? 'remove friend' : 'regret' }}
                  </t-button>
                  <!-- <t-button :loading="pendingUser.has(user.id)" variant="warning" size="xs" class="md:btn-sm" @click="toggleBlock(user)">
                    {{ pendingUser.has(user.id) ? '' : isBlocked(user) ? 'remove block' : 'regret' }}
                  </t-button> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </suspense>
  </div>
</template>

<style lang="scss">
.user-list {
  .user-list-item {
    .face {
      @apply transition-all;
      @apply drop-shadow-sm;
    }
    .actions {
      filter: blur(0.2em) opacity(0);
      transform: scale(1.05);
      @apply transition-all;
    }
    &:hover {
      .face {
        transform: translateY(-0.2em);
        @apply drop-shadow-xl;
        @apply transition-all;
      }
      .actions {
        transform: scale(1) translateY(-0.2em);
        filter: blur(0) opacity(1);
        @apply transition-all;
      }
    }

    @apply border-b-2 border-gbase-500/30;
  }
  @apply grid lg:grid-cols-2 gap-x-8;
}
</style>
