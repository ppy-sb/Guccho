<script setup lang="ts" async>
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
} from '$active'
import type { SwitcherState } from '~/components/app/mode-switcher.vue'
import type { SwitcherPropType } from '~/composables/useSwitcher'
import type { RouteLocationRaw } from '#vue-router'
import { CountryCode } from '~/def/country-code'
import { getFlagURL } from '~/utils/flag'

const config = useRuntimeConfig()

const route = useRoute('leaderboard-mode')
const router = useRouter()
const app = useNuxtApp()
const { supportedModes, supportedRulesets } = useAdapterConfig()
const { t } = useI18n()

const { mode: pMode } = route.params
const { ruleset: pRuleset, ranking: pRankingSystem, page: pPage, country: pCountry } = route.query

const availableRankingSystems = Object.keys(
  config.public.leaderboardRankingSystem
)
const mode = (
  isString(pMode) && includes(pMode, supportedModes) ? pMode : supportedModes[0]
) as ActiveMode

const ruleset = (
  isString(pRuleset) && includes(pRuleset, supportedRulesets)
    ? pRuleset
    : supportedRulesets[0]
) as ActiveRuleset

const rankingSystem = (
  isString(pRankingSystem) && availableRankingSystems.includes(pRankingSystem)
    ? pRankingSystem
    : availableRankingSystems[0]
) as LeaderboardRankingSystem

const page = shallowRef((isString(pPage) && Number.parseInt(pPage)) || 1)

const perPage = 20

const selectedCountry = ref<CountryCode | undefined>(
  (isString(pCountry) && Object.values(CountryCode).includes(pCountry as CountryCode))
    ? pCountry as CountryCode
    : undefined
)

const selected = ref<Required<SwitcherPropType<LeaderboardRankingSystem>>>({
  mode,
  ruleset,
  rankingSystem,
})
const { data: total } = await app.$client.rank.countLeaderboard.useQuery(
  computed(() => ({
    ...selected.value,
    country: selectedCountry.value,
  }))
)

const totalPages = computed(() =>
  Math.min(Math.ceil((total.value || 0) / perPage), 5)
)
watch(totalPages, boundaryPage, { immediate: true })

const queryLeaderboardValue = computed(() => ({
  mode: selected.value.mode,
  ruleset: selected.value.ruleset,
  rankingSystem: selected.value.rankingSystem,
  page: Math.max(page.value - 1, 0),
  pageSize: perPage,
  country: selectedCountry.value,
}))

const { status: leaderboardStatus, data: table } = await app.$client.rank.leaderboard.useQuery(
  queryLeaderboardValue
)

const pending = computed(() => leaderboardStatus.value === 'pending')

useHead({
  titleTemplate(title) {
    return `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`
  },
  title: () =>
    `${t(localeKey.mode(selected.value.mode))} | ${t(
      localeKey.ruleset(selected.value.ruleset)
    )} | ${t(localeKey.rankingSystem(selected.value.rankingSystem))} - ${t(
      localeKey.title.leaderboard.__path__
    )}`,
})

function boundaryPage() {
  const outOfRange = page.value > totalPages.value
  if (outOfRange) {
    page.value = totalPages.value
  }
}

function rewriteHistory() {
  const l = window.location
  const r = router.resolve(createRoute(selected.value))

  const rewrite = l.origin + r.fullPath
  history.replaceState({}, '', rewrite)
}

function reloadPage(i?: number) {
  if (i) {
    page.value = i
  }
  rewriteHistory()
}

function toggleCountry(country?: CountryCode) {
  if (selectedCountry.value === country) {
    selectedCountry.value = undefined
  }
  else {
    selectedCountry.value = country
  }
  page.value = 1
  rewriteHistory()
}

function createRoute(i: SwitcherState) {
  return {
    name: 'leaderboard-mode',
    params: {
      ...route.params,
      mode: i.mode,
    },
    query: {
      ranking: i.rankingSystem,
      ruleset: i.ruleset,
      page: page.value,
      ...(selectedCountry.value && { country: selectedCountry.value }),
    },
  } as RouteLocationRaw
}

const allCountries = computed(() => Object.values(CountryCode).filter(cc => cc !== CountryCode.Unknown))
const countrySearch = ref('')

const { data: availableCountries, status: countriesStatus, execute: executeCountriesQuery } = await app.$client.rank.getCountries.useQuery(
  computed(() => ({
    mode: selected.value.mode,
    ruleset: selected.value.ruleset,
    rankingSystem: selected.value.rankingSystem,
  })),
  {
    immediate: false,
  }
)

function openCountryDropdown() {
  if (availableCountries.value === null) {
    executeCountriesQuery()
  }
}

const filteredCountries = computed(() => {
  const countries = (availableCountries.value || countriesStatus.value === 'error')
    ? allCountries.value.filter(cc => availableCountries.value?.includes(cc) ?? true)
    : []

  if (!countrySearch.value) {
    return countries
  }
  const search = countrySearch.value.toLowerCase()
  return countries.filter((cc) => {
    const name = t(localeKey.country(cc)).toLowerCase()
    return name.includes(search) || cc.toLowerCase().includes(search)
  })
})
</script>

<i18n lang="yaml">
en-GB:
  no-score: No one played this mode yet.
  no-score-alt: Wanna be the first one? Go for it.
  total: '{total} rows'
  country: Country
  all-countries: All countries
  search-country: Search country...
  clear: Clear

zh-CN:
  no-score: 该模式目前还没有人玩过。
  no-score-alt: 想要成为第一名吗? 冲吧!
  total: '{total} 行'
  country: 地区
  all-countries: 所有地区
  search-country: 搜索地区...
  clear: 清除

fr-FR:
  no-score: Personne n'a joué ce mode encore.
  no-score-alt: Vous voulez être le premier? Allez-y.
  country: Pays
  all-countries: Tous les pays
  search-country: Rechercher un pays...
  clear: Effacer

de-DE:
  no-score: Noch niemand hat diesen Modus gespielt.
  no-score-alt: Möchtest du der Erste sein? Los geht's.
  total: '{total} Zeilen'
  country: Land
  all-countries: Alle Länder
  search-country: Land suchen...
  clear: Löschen
</i18n>

<template>
  <div
    class="flex flex-col h-full leaderboard custom-container mx-auto !max-w-4xl w-full"
  >
    <header-simple-title-with-sub
      id="desc"
      :title="t('title.leaderboard')"
      :subtitle="
        selected.mode
          && selected.ruleset
          && selected.rankingSystem
          && `${t(localeKey.mode(selected.mode))} - ${t(
            localeKey.ruleset(selected.ruleset),
          )} | ${t(localeKey.rankingSystem(selected.rankingSystem))}`
      "
    >
      <app-mode-switcher
        v-model="selected"
        :show-sort="true"
        :to-href="createRoute"
        @update:model-value="reloadPage()"
      />
      <template #after-title>
        <div class="space-y-2 w-full relative">
          <i18n-t keypath="total" tag="p" class="text-xs opacity-40">
            <template #total>
              <span class="font-mono">{{ total }}</span>
            </template>
          </i18n-t>
          <div class="flex gap-2 w-full">
            <div class="dropdown">
              <label
                tabindex="0"
                class="flex items-center gap-2"
                :class="selectedCountry ? '' : '-ms-3 btn btn-ghost btn-sm'"
                @click="openCountryDropdown"
              >
                <template v-if="selectedCountry">
                  <img
                    :alt="t(localeKey.country(selectedCountry))"
                    class="w-6 rounded"
                    :src="getFlagURL(selectedCountry)"
                  >
                  <span class="font-semibold">{{ t(localeKey.country(selectedCountry)) }}</span>
                  <span class="text-xs opacity-50">{{ selectedCountry }}</span>
                </template>
                <template v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span>{{ t('country') }}</span>
                </template>
              </label>
              <div
                tabindex="0"
                class="dropdown-content z-[1] rounded-box shadow-xl bg-base-100 p-2 w-80"
              >
                <input
                  v-model="countrySearch"
                  type="text"
                  :placeholder="t('search-country')"
                  class="input input-bordered input-sm w-full mb-2"
                >
                <div v-if="countriesStatus === 'pending'" class="flex justify-center py-4">
                  <div class="loading loading-sm" />
                </div>
                <ul v-else class="menu menu-sm max-h-80 overflow-auto">
                  <li
                    v-for="country in filteredCountries"
                    :key="country"
                  >
                    <a class="flex justify-between" @click="toggleCountry(country)">
                      <span class="flex items-center gap-2">
                        <img
                          :alt="t(localeKey.country(country))"
                          class="w-5"
                          :src="getFlagURL(country)"
                        >
                        {{ t(localeKey.country(country)) }}
                      </span>
                      <span class="flex items-center gap-2">
                        <span class="text-xs opacity-50">{{ country }}</span>
                        <span
                          v-if="selectedCountry === country"
                          class="text-primary"
                        >✓</span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <button
              v-if="selectedCountry"
              class="btn btn-ghost btn-xs btn-circle"
              :title="t('clear')"
              @click="toggleCountry()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </header-simple-title-with-sub>
    <div
      v-if="table"
      class="flex flex-col w-full"
      :class="{
        content: table.length,
      }"
    >
      <div
        v-if="table.length"
        class="relative w-full mx-auto overflow-x-auto xl:rounded-lg"
      >
        <table
          class="table table-xs md:table-sm xl:table-md table-zebra whitespace-nowrap"
          aria-describedby="desc"
        >
          <thead class="text-base">
            <tr>
              <th class="">
                Rank
              </th>
              <th
                class="text-center"
                :class="{
                  link: selectedCountry,
                }"
                @click="toggleCountry()"
              >
                <template
                  v-if="selectedCountry"
                >
                  {{ t('clear') }}
                </template>
                <template v-else>
                  Flag
                </template>
              </th>
              <th class="">
                Player
              </th>
              <th class="px-4 font-semibold text-end">
                {{ t(localeKey.rankingSystem(selected.rankingSystem)) }}
              </th>
              <th class="px-4 font-medium text-end">
                {{ t("global.accuracy") }}
              </th>
              <th class="px-4 font-medium text-end">
                {{ t("global.play-count") }}
              </th>
            </tr>
          </thead>
          <tbody
            class="transition-opacity origin-center transition-filter"
            :class="{
              'opacity-30 saturate-50 blur-md': pending,
            }"
          >
            <leaderboard-user-table
              v-for="(item, index) in table"
              :key="index"
              :user="item.user"
              :in-this-leaderboard="item.inThisLeaderboard"
              :sort="selected.rankingSystem"
              :switcher-state="selected"
              @select-country="toggleCountry"
            />
          </tbody>
        </table>
        <div
          class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none transition-filter blur-sm"
          :class="{
            'opacity-100 !blur-none': pending,
          }"
        >
          <div class="m-auto loading loading-lg" />
        </div>
      </div>
      <div
        v-else-if="!pending"
        class="pb-10 my-auto text-gbase-900 dark:text-gbase-100 grow"
      >
        <h1 class="text-xl font-semibold text-center">
          {{ t("no-score") }}
        </h1>
        <h2 class="text-sm font-semibold text-center opacity-60">
          {{ t("no-score-alt") }}
        </h2>
      </div>
      <div v-if="totalPages > 1" class="mx-auto mt-4 join outline outline-2">
        <a
          v-for="i in totalPages"
          :key="`pagination-${i}`"
          class="join-item btn btn-ghost [&.active]:outline [&.active]:bg-primary outline-2"
          :class="{
            active: page === i,
          }"
          type="radio"
          :href="$router.resolve(createRoute(selected) as any).fullPath"
          :aria-label="i.toString()"
          @click.prevent="reloadPage(i)"
        >
          {{ i }}
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.bigger-when-active:active {
  @apply font-semibold drop-shadow-md border-2 rounded-lg;
}
</style>
