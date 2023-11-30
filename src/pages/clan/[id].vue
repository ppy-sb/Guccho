<script lang="ts" async setup>
import { useSession } from '../../store/session'
import type { ActiveMode, ActiveRuleset, LeaderboardRankingSystem } from '~/def/common'
import { ClanRelation } from '~/def/clan'

// const pp = createPPFormatter()
// const score = createScoreFormatter()
const fmt = createNumberFormatter()

const session = useSession()
const { locale } = useI18n()
const app = useNuxtApp()
const config = useRuntimeConfig()
const { supportedModes, supportedRulesets } = useAdapterConfig()

const availableRankingSystems = Object.keys(config.public.leaderboardRankingSystem)
const route = useRoute('clan-id')
const { id } = route.params
const { mode: pMode, ruleset: pRuleset, ranking: pRankingSystem } = route.query
const mode = (
  (isString(pMode) && includes(pMode, supportedModes))
    ? pMode
    : supportedModes[0]
) as ActiveMode

const ruleset = (
  (isString(pRuleset) && includes(pRuleset, supportedRulesets))
    ? pRuleset
    : supportedRulesets[0]
) as ActiveRuleset

const rankingSystem = (
  (isString(pRankingSystem) && availableRankingSystems.includes(pRankingSystem))
    ? pRankingSystem
    : availableRankingSystems[0]
) as LeaderboardRankingSystem

const selected = ref<Required<SwitcherPropType<LeaderboardRankingSystem>>>({
  mode,
  ruleset,
  rankingSystem,
})

const mergeQuery = computed(() => ({ ...selected.value, id }))
const { data: clan, refresh: refreshClan } = await app.$client.clan.detail.useQuery(mergeQuery)
const relation = ref(
  session.loggedIn
    ? clan.value
      ? await app.$client.clan.relation.query({ id: clan.value.id })
      : ClanRelation.JoinedOtherClan
    : null
)

const allowToJoin = [
  ClanRelation.Free,
  ClanRelation.Left,
  ClanRelation.QuitPendingVerification,
]
const allowToLeave = [
  ClanRelation.Member,
  ClanRelation.JoinPendingVerification,
]
async function requestJoin() {
  if (!clan.value) {
    return
  }
  relation.value = await app.$client.clan.join.mutate({ id: clan.value.id })
  return refreshClan()
}
async function requestLeave() {
  if (!clan.value) {
    return
  }
  relation.value = await app.$client.clan.leave.mutate({ id: clan.value.id })
  return refreshClan()
}
</script>

<template>
  <section class="container mx-auto custom-container !max-w-5xl">
    <template v-if="clan">
      <div class="px-2 lg:px-0">
        <div class="flex flex-col items-center gap-8 md:flex-row">
          <div class="relative drop-shadow-md">
            <img :alt="clan.name" :src="clan.avatarSrc" class="object-cover w-48 h-auto mask mask-squircle">
            <span class="absolute bottom-0 right-0 font-semibold badge badge-lg md:badge-xl">
              {{ clan.badge }}
            </span>
          </div>
          <p class="md:self-end flex flex-col md:flex-row grow">
            <span class="text-3xl md:text-4xl">{{ clan.name }}</span>
            <template v-if="session.loggedIn">
              <button v-if="includes(relation, allowToJoin)" class="mx-auto md:ms-auto md:me-0 btn btn-primary btn-circle" @click="requestJoin">
                <icon name="material-symbols:group-add-outline-rounded" class="w-5 h-5" />
              </button>
              <button v-else-if="includes(relation, allowToLeave)" class="mx-auto md:ms-auto md:me-0 btn btn-primary btn-circle" @click="requestLeave">
                <icon name="material-symbols:group-remove-outline-rounded" class="w-5 h-5" />
              </button>
            </template>
          </p>
        </div>
      </div>
      <div class="pt-8 md:pt-12">
        <dl>
          <div class="striped rounded-tl-xl">
            <dt class="text-sm font-medium text-gbase-500">
              Owner
            </dt>
            <dd class="striped-text">
              <nuxt-link-locale :to="{ name: 'user-handle', param: { handle: clan.owner.safeName } }" class="flex items-center gap-1">
                <div class="w-8 h-8 mask mask-squircle">
                  <img :src="clan.owner.avatarSrc" alt="avatar">
                </div>
                <span class="font-bold whitespace-nowrap" :class="useUserRoleColor(clan.owner)">{{ clan.owner.name }}</span>
              </nuxt-link-locale>
            </dd>
          </div>
          <div class="striped">
            <dt class="text-sm font-medium text-gbase-500">
              Created at
            </dt>
            <dd class="flex items-center gap-1 striped-text">
              {{ clan.createdAt.toLocaleString(locale) }}
            </dd>
          </div>
          <div class="striped">
            <dt class="text-sm font-medium text-gbase-500">
              Joined user
            </dt>
            <dd class="flex items-center gap-1 striped-text">
              {{ fmt(clan.countUser) }}
            </dd>
          </div>
          <!-- <span v-if="selected.rankingSystem === Rank.PPv2">Average: <b>{{ pp(clan.sum[Rank.PPv2] / clan.countUser) }}</b>pp</span>
          <span v-else-if="selected.rankingSystem === Rank.PPv1">Average: <b>{{ pp(clan.sum[Rank.PPv1] / clan.countUser) }}</b>pp</span>
          <span v-else-if="selected.rankingSystem === Rank.RankedScore">Total Score: <b>{{ score(clan.sum[Rank.RankedScore]) }}</b></span>
          <span v-else-if="selected.rankingSystem === Rank.TotalScore">Total Score: <b>{{ score(clan.sum[Rank.TotalScore]) }}</b></span> -->
        </dl>
      </div>
    </template>
    <template v-else>
      Clan Not Found.
      <!-- <div class="flex mt-2 -space-x-4 rtl:space-x-reverse">
        <div v-for="user in clan.users" :key="clan.id + user.name" class="tooltip" :data-tip="user.name">
            <img class="object-cover w-12 h-12 mask mask-squircle " :src="user.avatarSrc" :alt="user.name">
          </div>
        <a v-if="clan.countUser - clan.users.length" class="flex items-center justify-center w-12 h-12 text-xs font-medium text-white bg-gray-700 mask mask-squircle tooltip hover:bg-gray-600" href="#">+{{ (clan.countUser - clan.users.length).toLocaleString() }}</a>
      </div> -->
    </template>
  </section>
</template>
