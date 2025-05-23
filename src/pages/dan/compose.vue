<script setup lang="ts">
import type { inferRouterOutputs } from '@trpc/server'
import { validateUsecase } from '~/common/utils/dan'
import { type DatabaseDan, Requirement, type RequirementCondBinding } from '~/def/dan'
import type { AppRouter } from '~/server/trpc/routers'
import { useSession } from '~/store/session'

const tRequirement = localeKey.root.dan.requirement

type RouterOutput = inferRouterOutputs<AppRouter>
const requirements = [Requirement.Pass, Requirement.NoPause]
const typeAC = [Requirement.Pass, Requirement.NoPause]
const app = useNuxtApp()
const route = useRoute()
const session = useSession()
const { t } = useI18n()

const qId = route.query.id?.toString()

const defaultValue: Omit<DatabaseDan<string>, 'createdAt' | 'updatedAt'> & Partial<Pick<DatabaseDan<string>, 'createdAt' | 'updatedAt'>> & { _db: boolean } = {
  id: '',
  name: '',
  description: '',
  requirements: [],
  _db: false,
}

const { data: compose } = await useAsyncData('compose', async () => {
  return qId ? await _getDB(qId) : structuredClone(defaultValue)
})

const data = ref<RouterOutput['dan']['userRule']>()
const loading = ref(false)
const selectedIdx = ref(compose.value?.requirements.length ? 0 : null)

const selectedRequirement = computed(() =>
  compose.value && selectedIdx.value !== null && compose.value.requirements[selectedIdx.value]
    ? compose.value.requirements[selectedIdx.value]
    : null
)

// watch(compose, () => {
//   localStorage.setItem('dan-compose', JSON.stringify(compose.value))
// }, { deep: true })

const fmtScore = createNumberFormatter()

function loadLast() {
  const save = localStorage.getItem('dan-compose')
  if (!save) {
    return
  }
  compose.value = JSON.parse(save)
}

function copy() {
  navigator?.clipboard.writeText(JSON.stringify(compose.value))
}

async function readClipboard() {
  const text = await navigator.clipboard.readText()
  if (!text) {
    return
  }
  compose.value = unDB(JSON.parse(text))
}

async function getDB() {
  if (!compose.value) {
    return
  }
  loading.value = true
  try {
    compose.value = await _getDB(compose.value.id)
  }
  finally {
    loading.value = false
  }
}

async function _getDB(id: string) {
  return {
    ...await app.$client.dan.get.query(id),
    _db: true,
  }
}

async function runDB() {
  if (!compose.value) {
    return
  }
  loading.value = true
  try {
    data.value = await app.$client.dan.userRule.query(validateUsecase(compose.value))
  }
  finally {
    loading.value = false
  }
}
function reset() {
  compose.value = defaultValue
}

async function saveDB() {
  if (!compose.value) {
    return
  }
  loading.value = true
  compose.value = {
    ...await app.$client.dan.save.mutate(compose.value, {
      context: {
        skipBatch: true,
      },
    }),
    _db: true,
  }
  localStorage.setItem('dan-compose', JSON.stringify(compose.value))
  loading.value = false
}
async function deleteDB() {
  if (!compose.value) {
    return
  }
  await app.$client.dan.delete.mutate(compose.value.id)
  reset()
}
async function duplicate() {
  if (!compose.value) {
    return
  }
  compose.value = unDB(compose.value)
}

function unDB<T extends Omit<DatabaseDan<string>, 'createdAt' | 'updatedAt'> & Partial<Pick<DatabaseDan<string>, 'createdAt' | 'updatedAt'>>>(val: T): T {
  val = validateUsecase(val)
  ;(val as any)._db = false
  val.id = ''
  return val
}

function confirm(msg: string) {
  return window.confirm(msg)
}
</script>

<i18n lang="yaml">
en-GB:
  delete-confirm: Are you sure? This action cannot be undone.

zh-CN:
  delete-confirm: 确定删除? 本操作无法撤销。
</i18n>

<template>
  <section class="container max-w-screen-lg mx-auto">
    <!-- Flat Header Bar -->
    <div class="sticky z-10 flex flex-wrap items-center gap-2 py-3 top-14">
      <h1 class="flex-1 text-2xl font-bold">
        Compose
      </h1>
      <span v-if="compose?._db" class="badge badge-info">DB</span>
      <span v-else class="badge badge-neutral">Unsaved</span>
      <span class="text-xs text-base-content/60">ID: {{ compose?.id || '-' }}</span>
      <button class="btn btn-primary btn-sm" :disabled="!session.role.beatmapNominator" @click="saveDB">
        <i v-if="loading" class="loading" />Save
      </button>
      <button class="btn btn-warning btn-sm" :disabled="!compose?._db || !session.role.beatmapNominator" @click="confirm(t('delete-confirm')) && deleteDB()">
        <i v-if="loading" class="loading" />Delete
      </button>
      <button class="btn btn-info btn-sm" :disabled="!compose?._db" @click="duplicate">
        Duplicate
      </button>
      <button class="btn btn-accent btn-sm" @click="runDB">
        Dry Run
      </button>
      <button class="btn btn-outline btn-sm" @click="reset">
        Reset
      </button>
      <button class="btn btn-outline btn-sm" @click="loadLast">
        Recover
      </button>
      <button class="btn btn-outline btn-sm" @click="copy">
        Copy
      </button>
      <button class="btn btn-outline btn-sm" @click="readClipboard">
        Paste
      </button>
    </div>
    <template v-if="compose">
      <!-- Name and Description Fields (above requirements columns) -->
      <div class="flex flex-col items-stretch gap-2 mb-2 md:flex-row">
        <div class="flex flex-1 gap-2">
          <label class="w-1/5 font-semibold">Name</label>
          <input v-model="compose.name" class="flex-1 input" type="text" name="name" placeholder="Requirement name...">
        </div>
      </div>
      <div class="flex gap-2 mb-2">
        <label class="w-1/5 font-semibold">Description</label>
        <textarea v-model="compose.description" class="flex-1 textarea" name="description" placeholder="Description..." />
      </div>
      <div class="divider">
        <span class="font-semibold">Requirements</span>
      </div>
      <!-- Requirements and Editor Columns -->
      <div class="flex flex-col w-full gap-2 md:flex-row grow">
        <!-- Requirements List (Left) -->
        <div class="flex flex-col gap-2 md:w-1/5">
          <div class="flex flex-col gap-1">
            <div
              v-for="(ach, i) in compose.requirements"
              :key="i"
              class="flex items-center gap-2 px-2 py-1 transition rounded cursor-pointer hover:bg-base-300"
              :class="{ 'bg-base-200': selectedIdx === i }"
              @click="selectedIdx = i"
            >
              <select
                v-model="ach.type"
                class="select select-sm"
                :disabled="selectedIdx !== i"
              >
                <option value="">
                  select
                </option>
                <option
                  v-for="ac in typeAC"
                  :key="ac"
                  :value="ac"
                  :disabled="!!requirements.find((i, idx) => i === ac && idx !== selectedIdx)"
                >
                  {{ t(tRequirement[ac].__path__) }}
                </option>
              </select>
              <button
                class="ml-auto btn btn-xs btn-error btn-circle"
                @click.stop="compose && (compose.requirements as RequirementCondBinding<Requirement, any>[]).splice(i, 1)"
              >
                <icon name="material-symbols:delete" />
              </button>
            </div>
          </div>
          <button
            class="btn btn-xs btn-success"
            :disabled="compose!.requirements.length >= 2"
            @click="compose && (compose.requirements as RequirementCondBinding<Requirement, any>[]).push({ type: typeAC.find(ac => !compose!.requirements.find(i => i.type === ac)) || typeAC[0], cond: undefined })"
          >
            + Add
          </button>
        </div>
        <!-- Requirement Editor (Right) -->
        <app-dan-cond
          v-if="selectedRequirement"
          v-model="selectedRequirement.cond"
          class="md:w-4/5"
          :list-mode="false"
          :requirements="compose.requirements"
          :current="selectedRequirement"
        />
        <div v-else class="flex items-center justify-center h-full text-base-content/60">
          Select a requirement to edit
        </div>
      </div>
    </template>
    <!-- Collapsible Results Table -->
    <div v-if="data" class="py-4">
      <details open class="border collapse bg-base-100 border-base-300">
        <summary class="font-bold cursor-pointer collapse-title">
          Dry Run Results
        </summary>
        <div class="collapse-content">
          <table v-for="ach, i in data" :key="i" class="table mb-4 table-zebra caption-top">
            <thead>
              <tr>
                <th>User</th>
                <th>Beatmap</th>
                <th class="text-right">
                  Score ID
                </th>
                <th class="text-right">
                  Score
                </th>
                <th class="text-right">
                  Accuracy
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in ach.scores" :key="result.score.id">
                <th scope="row">
                  <nuxt-link-locale class="link text-sky-500" :to="{ name: 'user-handle', params: { handle: result.player.id } }">
                    {{ result.player.name }}
                  </nuxt-link-locale>
                </th>
                <td>
                  <a :href="`/b/${result.beatmap.id}`" class="link text-sky-500">{{ result.beatmap.artist }} - {{ result.beatmap.title }} [{{ result.beatmap.version }}]</a>
                </td>
                <td class="font-mono text-right">
                  <nuxt-link-locale class="link text-sky-500" :to="{ name: 'score-id', params: { id: result.score.id } }">
                    {{ result.score.id }}
                  </nuxt-link-locale>
                </td>
                <td class="font-mono text-right">
                  {{ fmtScore(result.score.score) }}
                </td>
                <td class="font-mono text-right">
                  {{ result.score.accuracy.toFixed(3) }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  </section>
</template>

<style scoped>

</style>
