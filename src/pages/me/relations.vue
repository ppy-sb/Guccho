<script setup lang="ts">
import type { UserCompact } from '~/def/user'
import type { UserRelationship } from '~/def/user-relationship'
import { MutualRelationship, Relationship } from '~/def'
import { useSession } from '~/store/session'

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

const {
  data: relations,
  refresh: refreshRelations,
} = await app$.$client.me.relations.useQuery()
const {
  data: haveUserAsTheirFriend,
  refresh: refreshHaveUserAsTheirFriend,
} = await app$.$client.me.notAsMutual.useQuery()
const config = useAppConfig()
const { t } = useI18n()

useHead({
  titleTemplate: `Friends - ${config.title}`,
})
if (!relations.value) {
  throw new Error(t('user-not-found'))
}

const errorMessage = shallowRef('')

onErrorCaptured((err) => {
  errorMessage.value = err.message || t('err-message')
})
function haveRelation(relation: Relationship, user: UserCompact<string> & UserRelationship) {
  return user.relationship.includes(relation)
}

const pendingUser = reactive(new Set<string>())
async function toggleRelation(type: Relationship, user: UserCompact<string> & UserRelationship) {
  pendingUser.add(user.id)
  try {
    if (haveRelation(type, user)) {
      await removeOneAs(type, user)
      user.relationship = user.relationship.filter(k => k !== type)
    }
    else {
      await addOneAs(type, user)
      user.relationship.push(type)
    }
    pendingUser.delete(user.id)
    refreshHaveUserAsTheirFriend()
  }
  catch (e) {
    pendingUser.delete(user.id)
  }
}

async function addOneAs(type: Relationship, user: { id: string }) {
  await app$.$client.me.addOneRelation.mutate({ type, target: user.id })
}
async function removeOneAs(type: Relationship, user: { id: string }) {
  await app$.$client.me.removeOneRelation.mutate({ type, target: user.id })
}

async function addAsMutual(type: Relationship, user: { id: string }) {
  await addOneAs(Relationship.Friend, user)
  await Promise.all([refreshRelations(), refreshHaveUserAsTheirFriend()])
}

const toggleFriend = toggleRelation.bind(null, Relationship.Friend)
const isFriend = haveRelation.bind(null, Relationship.Friend)
// const toggleBlock = toggleRelation.bind(null, 'block')
// const isBlocked = haveRelation.bind(null, 'block')
</script>

<i18n lang="yaml">
en-GB:
  loading: Loading...
  err-message: Something went wrong.
  user-not-found: User does not exist.
  mutual-friends: Mutual friends
  remove-friend: Breakup
  regret: Regret
  you-may-also-wonder: You may also wonder...
  non-mutual-friends: These people have added you as their friend.
  mutual: Mutual

zh-CN:
  loading: 加载中...
  err-message: 出现了一些问题。
  user-not-found: 用户不存在。
  remove-friend: 删除好友
  regret: 后悔了。。
  you-may-also-wonder: 你可能也会好奇...
  non-mutual-friends: 这些人已将你添加为好友。
  mutual: 互粉

fr-FR:
  loading: Chargement...
  err-message: Une erreur est survenue.
  user-not-found: Utilisateur inexistant.
  remove-friend: Retirer l'ami
  regret: Regret
  you-may-also-wonder: Vous pourriez également vous demander...
  non-mutual-friends: Ces personnes vous ont ajouté en tant qu'ami.
  mutual: Mutuel
</i18n>

<template>
  <div class="container pt-24 mx-auto custom-container">
    <suspense>
      <template #fallback>
        <div>
          {{ errorMessage || t('loading') }}
        </div>
      </template>
      <div>
        <div class="mx-auto user-list">
          <div v-for="user in relations" :key="`relation-@${user.safeName}`" class="w-full p-2 user-list-item">
            <div class="flex items-center justify-center gap-2 md:justify-start face">
              <div class="relative z-10 mask mask-squircle hoverable">
                <img :src="user.avatarSrc" class="pointer-events-none w-14 md:w-[4em]">
              </div>
              <div class="grow">
                <h1 class="text-2xl text-left md:text-3xl">
                  {{ user.name }} <div v-if="user.mutualRelationship.some(r => r === MutualRelationship.MutualFriend)" class="badge badge-primary">
                    <icon name="solar:heart-bold" class="w-4 h-4" />
                  </div>
                </h1>
                <div class="flex justify-between w-full items-top">
                  <nuxt-link-locale
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
                  </nuxt-link-locale>
                  <div class="flex gap-2 actions">
                    <!-- <t-button class="btn-shadow" variant="info" size="xs" class="md:btn-sm">
                      chat
                    </t-button> -->
                    <t-button
                      class="btn-shadow md:btn-sm" :loading="pendingUser.has(user.id)"
                      :variant="isFriend(user) ? 'warning' : 'primary'" size="xs"
                      @click="toggleFriend(user)"
                    >
                      <template v-if="pendingUser.has(user.id)" />
                      <template v-else-if="isFriend(user)">
                        {{ t('remove-friend') }}
                        <icon name="solar:heart-broken-bold" class="w-4 h-4" />
                      </template>
                      <template v-else>
                        {{ t('regret') }}
                        <icon name="solar:heart-bold" class="w-4 h-4" />
                      </template>
                    </t-button>
                    <!-- <t-button class="btn-shadow" :loading="pendingUser.has(user.id)" variant="warning" size="xs" class="md:btn-sm" @click="toggleBlock(user)">
                      {{ pendingUser.has(user.id) ? '' : isBlocked(user) ? 'remove block' : 'regret' }}
                    </t-button> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="haveUserAsTheirFriend.length" class="divider text-xl py-8">
          {{ t('you-may-also-wonder') }}
        </div>

        <template v-if="haveUserAsTheirFriend.length">
          <div class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ t('non-mutual-friends') }}</span>
          </div>
          <div class="mx-auto user-list">
            <div
              v-for="user in haveUserAsTheirFriend" :key="`relation-@${user.safeName}`"
              class="w-full p-2 user-list-item"
            >
              <div class="flex items-center justify-center gap-2 md:justify-start face">
                <div class="relative z-10 mask mask-squircle hoverable">
                  <img :src="user.avatarSrc" class="pointer-events-none w-14 md:w-[4em]">
                </div>
                <div class="grow">
                  <h1 class="text-2xl text-left md:text-3xl">
                    {{ user.name }}
                  </h1>
                  <div class="flex justify-between w-full items-top">
                    <nuxt-link-locale
                      :key="`${user.id}:notMutual`"
                      class="text-lg text-left underline md:text-2xl decoration-sky-500 text-gbase-600 dark:text-gbase-300 hover:text-gbase-500"
                      :to="{
                        name: 'user-handle',
                        params: {
                          handle: `@${user.safeName}`,
                        },
                      }"
                    >
                      @{{ user.safeName }}
                    </nuxt-link-locale>
                    <div class="flex gap-2 actions">
                      <t-button
                        class="btn-shadow md:btn-sm" :loading="pendingUser.has(user.id)" variant="primary" size="xs"
                        @click="addAsMutual(Relationship.Friend, user)"
                      >
                        {{ t('mutual') }}<icon name="solar:heart-bold" class="w-4 h-4" />
                      </t-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
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

    // .actions {
    //   filter: blur(0.2em) opacity(0);
    //   transform: scale(1.05);
    //   @apply transition-all;
    // }

    &:hover {
      .face {
        transform: translateY(-0.2em);
        @apply drop-shadow-xl;
        @apply transition-all;
      }

      .actions {
        transform: scale(1) translateY(-0.2em);
        // filter: blur(0) opacity(1);
        @apply transition-all;
      }
    }

    @apply border-b-2 border-gbase-500/30;
  }

  @apply grid lg:grid-cols-2 gap-x-8;
}
</style>
