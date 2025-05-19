<script setup lang="tsx">
import { type DatabaseDan, Requirement } from '~/def/dan'
import { useSession } from '~/store/session'
import type { DanProvider } from '$base/server'

const fmtScore = createNumberFormatter()
const tRequirement = localeKey.root.dan.requirement

const app = useNuxtApp()
const { t } = useI18n()
const route = useRoute('dan-detail-id')
const session = useSession()

const defaultValue: Omit<DatabaseDan<string>, 'createdAt' | 'updatedAt'> & Partial<Pick<DatabaseDan<string>, 'createdAt' | 'updatedAt'>> & { _db: boolean } = {
  id: '',
  name: '',
  description: '',
  requirements: [],
  _db: false,
}

const { data: item } = await useAsyncData(() => app.$client.dan.get.query(route.params.id), {
  default: () => structuredClone(defaultValue),
})

useHead({
  title: `${item.value.name} - ${app.$i18n.t(localeKey.title.dan.dans.__path__)}`,
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
})

const tableCtx = reactive({
  [Requirement.Pass]: {
    page: 0,
    perPage: 10,
    orderBy: undefined as [DanProvider.PickType, 'asc' | 'desc'] | undefined,
    pick: undefined as DanProvider.PickType | undefined,
  },
  [Requirement.NoPause]: {
    page: 0,
    perPage: 10,
    orderBy: undefined as [DanProvider.PickType, 'asc' | 'desc'] | undefined,
    pick: undefined as DanProvider.PickType | undefined,
  },
})

const qualifiedScores = ref({
  [Requirement.Pass]: await app.$client.dan.getQualifiedScores.useQuery(computed(() => ({
    id: route.params.id,
    requirement: Requirement.Pass,
    ...tableCtx[Requirement.Pass],
  }))),
  [Requirement.NoPause]: await app.$client.dan.getQualifiedScores.useQuery(computed(() => ({
    id: route.params.id,
    requirement: Requirement.NoPause,
    ...tableCtx[Requirement.NoPause],
  }))),
})

async function toPage(requirement: Requirement, page: number) {
  tableCtx[requirement].page = page
}

async function changeOrder(req: Requirement, by: DanProvider.PickType) {
  tableCtx[req].orderBy = [
    by,
    tableCtx[req].orderBy
      ? tableCtx[req].orderBy[0] === by
        ? tableCtx[req].orderBy[1] === 'desc'
          ? 'asc'
          : 'desc'
        : 'asc'
      : 'asc',
  ]
}

function Swap(props: { ctx: { orderBy?: [DanProvider.PickType, 'asc' | 'desc'] } }) {
  return <label
    class={{
      'swap-active': props.ctx.orderBy![1] === 'asc',
      'swap swap-flip': true,
    }}
  >
    <div class="swap-on">
      <icon
        name="mingcute:sort-ascending-fill"
      />
    </div>
    <div class="swap-off">
      <icon
        name="mingcute:sort-descending-fill"
      />
    </div>
  </label>
}

const admin = {
  async recalc() {
    await app.$client.dan.userClearedScores.recalc.mutate({ dan: { id: item.value.id } })
    for (const v of Object.values(qualifiedScores.value)) {
      v.refresh()
    }
  },
}
</script>

<i18n lang="yaml">
en-GB:
  qf-scores: Qualified Scores
  load-qualified-scores: load qualified scores
  mode: Mode...
  ruleset: Rule...
  unset: Unset
  treat-no-ruleset-cond-as-standard: treat dans with no ruleset requirement as standard
  dedupe-with: Deduplicate with
  dedupe:
    no: No
    id: First qualified
    score: Highest score
    accuracy: Highest accuracy
    pp: Max pp

zh-CN:
  qf-scores: 满足条件的成绩
  load-qualified-scores: 加载满足条件的成绩
  mode: 模式
  ruleset: 玩法
  unset: 未指定
  treat-no-ruleset-cond-as-standard: 将无玩法要求的段位视为std端位
  dedupe-with: 去重
  dedupe:
    no: 不去重
    id: 最早通过
    score: 最高分
    accuracy: 最高ACC
    pp: 最高PP

# TODO fr, DE
</i18n>

<template>
  <div class="container px-4 mx-auto custom-container">
    <h1 class="mb-2 text-3xl link">
      {{ item.name }}
    </h1>
    <p class="whitespace-pre-wrap">
      {{ item.description }}
    </p>
    <dan-explain-requirement v-for="requirement in item.requirements" :key="requirement.type" :requirement="requirement" />
    <div class="mt-2 space-x-2 text-right">
      <nuxt-link-locale v-if="session.role.staff" class="btn btn-sm" :to="{ name: 'dan-compose', query: { id: item.id } }">
        Edit
      </nuxt-link-locale>
    </div>
    <h2 class="w-full text-xl font-bold divider">
      {{ t('qf-scores') }}
    </h2>
    <div v-for="requirement in item.requirements" :key="requirement.type">
      <h3 class="mb-2 text-lg font-bold">
        {{ t(tRequirement[requirement.type].__path__) }}
      </h3>
      <div class="relative mb-2 overflow-x-auto border rounded-md border-base-300 bg-base-100">
        <div class="grid grid-cols-4 px-2 pt-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
          <div class="col-span-2 form-control">
            <label for="s" class="label label-text">{{ t('dedupe-with') }}</label>
            <select id="s" v-model="tableCtx[requirement.type].pick" class="select select-sm">
              <option :value="undefined">
                {{ t('dedupe.no') }}
              </option>
              <option value="id">
                {{ t('dedupe.id') }}
              </option>
              <option value="pp">
                {{ t('dedupe.pp') }}
              </option>
              <option value="accuracy">
                {{ t('dedupe.accuracy') }}
              </option>
              <option value="score">
                {{ t('dedupe.score') }}
              </option>
            </select>
          </div>
        </div>
        <table
          class="table transition-all table-sm table-zebra"
          :class="{
            'opacity-30 saturate-50 blur-md': qualifiedScores[requirement.type].status === 'pending',
          }"
        >
          <thead>
            <tr>
              <th scope="col" rowspan="2">
                User
              </th>
              <th scope="col" rowspan="2">
                Beatmap
              </th>
              <th scope="col" colspan="3">
                Score
              </th>
            </tr>
            <tr>
              <th class="text-end" scope="col" @click="changeOrder(requirement.type, 'id')">
                Link
                <Swap v-if="tableCtx[requirement.type].orderBy?.[0] === 'id'" :ctx="tableCtx[requirement.type]" />
              </th>
              <th class="text-end" scope="col" @click="changeOrder(requirement.type, 'accuracy')">
                Accuracy
                <Swap v-if="tableCtx[requirement.type].orderBy?.[0] === 'accuracy'" :ctx="tableCtx[requirement.type]" />
              </th>
              <th class="text-end" scope="col" @click="changeOrder(requirement.type, 'score')">
                Score
                <Swap v-if="tableCtx[requirement.type].orderBy?.[0] === 'score'" :ctx="tableCtx[requirement.type]" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in qualifiedScores[requirement.type].data?.scores" :key="result.score.id">
              <th
                scope="row"

                class="whitespace-nowrap"
              >
                <nuxt-link-locale
                  class="link text-sky-500"
                  :to="{
                    name: 'user-handle',
                    params: {
                      handle: result.player.id,
                    },
                  }"
                >
                  {{ result.player.name }}
                </nuxt-link-locale>
              </th>
              <td class="whitespace-nowrap">
                <a
                  :href="`/b/${result.beatmap.id}`"
                  class="link text-sky-500"
                >
                  {{ result.beatmap.artist }} - {{ result.beatmap.title }} [{{ result.beatmap.version }}]
                </a>
              </td>
              <td class="font-mono whitespace-nowrap text-end">
                <nuxt-link-locale
                  class="link text-sky-500"
                  :to="{
                    name: 'score-id',
                    params: {
                      id: result.score.id,
                    },
                  }"
                >
                  {{ result.score.id }}
                </nuxt-link-locale>
              </td>
              <td class="font-mono whitespace-nowrap text-end">
                {{ result.score.accuracy }}<small>%</small>
              </td>
              <td class="font-mono whitespace-nowrap text-end">
                {{ fmtScore(result.score.score) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none transition-filter blur"
          :class="{
            'opacity-100 blur-none': qualifiedScores[requirement.type].status === 'pending',
          }"
        >
          <div class="m-auto loading" />
        </div>
      </div>

      <div class="flex">
        <div v-if="((qualifiedScores[requirement.type].data?.count || 0) / tableCtx[requirement.type].perPage) > 1" class="mx-auto mt-4 join outline outline-2">
          <a
            v-for="(v, i) in Math.ceil((qualifiedScores[requirement.type].data?.count || 0) / tableCtx[requirement.type].perPage)"
            :key="`pagination-${i}`"
            class="join-item btn btn-ghost [&.active]:outline [&.active]:bg-primary outline-2"
            :class="{
              active: tableCtx[requirement.type].page === i,
            }"
            type="radio"
            :aria-label="i.toString()"
            :active="tableCtx[requirement.type].page === v"
            @click="toPage(requirement.type, i)"
          >
            {{ v }}
          </a>
        </div>
      </div>
    </div>
    <div v-if="session.role.staff" class="p-2 mt-4 rounded-md bg-base-100">
      <h3 class="text-lg">
        Admin Zone
      </h3>
      <button
        class="btn btn-primary"
        @click="admin.recalc"
      >
        recalc scores
      </button>
    </div>
  </div>
</template>

<style scoped></style>
