<script setup lang="ts">
import type { UserProvider } from '~/server/backend/$base/server'
import userpageStore from '~/store/userpage'
import { StableMod } from '~/def/score'

const app = useNuxtApp()
const { t } = useI18n()
const page = userpageStore()

const pagination = shallowRef(0)
const outStatus = ref<'idle' | 'pending' | 'error' | 'success'>('pending')

defineExpose({
  status: outStatus,
})
const {
  data: recent,
  error: err,
  refresh,
  pending,
  status,
} = await useAsyncData(async () => {
  if (
    !page.user
    || !page.switcher.mode
    || !page.switcher.ruleset
    || !page.switcher.rankingSystem
  ) {
    return {
      scores: [],
      handle: page.user?.id,
      bpPage: pagination.value,
      lastSwitcherStatus: {
        ...page.switcher,
      },
    }
  }
  return {
    scores: await app.$client.user.recent.query({
      id: page.user.id,
      mode: page.switcher.mode,
      ruleset: page.switcher.ruleset,
      rankingSystem: page.switcher.rankingSystem,
      page: pagination.value,
    }) as UserProvider.RecentScoresResult<string, string>[],
    page: pagination.value,
    id: page.user.id,
    lastSwitcherStatus: {
      ...page.switcher,
    },
  }
})
watch([() => page.user, page.switcher, pagination], async () => {
  if (!page.user) {
    return
  }
  await refresh()
})

watch(status, (val) => {
  outStatus.value = val
})
outStatus.value = status.value
</script>

<i18n src="./scores.base.yaml" lang="yaml" />

<i18n lang="yaml">
en-GB:
  recent: Recent Scores
  folded: '{i} Folded Scores'

zh-CN:
  recent: 最近成绩
  folded: '{i} 个折叠的成绩'

# TODO FR
# TODO DE
</i18n>

<template>
  <div v-if="err">
    {{ err }}
  </div>
  <template v-else-if="page.user">
    <section v-if="recent?.scores?.length">
      <div class="card" :class="[pending && 'pointer-events-none']">
        <div class="flex items-center p-1 two-tone w-100">
          <icon name="carbon:letter-pp" class="w-1/6" size="2em" />
          <div class="flex w-2/3">
            <div class="mx-auto text-3xl font-semibold">
              {{ t('recent') }}
            </div>
          </div>
        </div>
        <div
          class="transition-[filter] transition-opacity duration-200" :class="{
            'saturate-50 opacity-30': pending,
          }"
        >
          <div class="relative">
            <ul>
              <li v-for="(i, idx) in recent.scores" :key="`recent-${idx}`" class="score">
                <template v-if="i.type === 'single'">
                  <app-score-list-item
                    :score="i" :mode="recent.lastSwitcherStatus.mode"
                    :ruleset="recent.lastSwitcherStatus.ruleset" :ranking-system="recent.lastSwitcherStatus.rankingSystem"
                  />
                </template>
                <template v-else-if="i.type === 'group'">
                  <div>
                    <app-score-list-item
                      v-if="i.scores.find(v => v.id === i.pinned)"
                      :score="{
                        ...i.scores.find(v => v.id === i.pinned)!,
                        beatmap: i.beatmap,
                      }" :mode="recent.lastSwitcherStatus.mode"
                      :ruleset="recent.lastSwitcherStatus.ruleset" :ranking-system="recent.lastSwitcherStatus.rankingSystem"
                    />
                    <table />
                    <div tabindex="0" class="collapse">
                      <div class="link">
                        <icon name="tabler:layers-selected" /> {{ t('folded', { i: i.scores.length - 1 }) }}
                      </div>
                      <div class="collapse-content !p-0">
                        <div class="scroll-x-auto">
                          <table class="table table-sm table-zebra">
                            <thead>
                              <tr>
                                <th class="text-end">
                                  Link
                                </th>
                                <th class="text-start">
                                  Rank
                                </th>
                                <th class="text-end">
                                  PP
                                </th>
                                <th class="text-end">
                                  Score
                                </th>
                                <th class="text-end">
                                  Accuracy
                                </th>
                                <th class="text-center">
                                  Mods
                                </th>
                                <th class="text-start">
                                  Date
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="s in i.scores"
                                :key="`recent-folded-${s.id}`"
                              >
                                <th class="text-end font-mono">
                                  <nuxt-link-locale
                                    class="link"
                                    :to="{
                                      name: 'score-id',
                                      params: { id: s.id },
                                    }"
                                  >
                                    <icon v-if="i.pinned === s.id" name="material-symbols:star-outline-rounded" />{{ s.id }}
                                  </nuxt-link-locale>
                                </th>
                                <td>{{ s.grade }}</td>
                                <td class="text-end font-mono">
                                  {{ s.pp.toFixed(2) }}
                                </td>
                                <td class="text-end font-mono">
                                  {{ s.score.toLocaleString() }}
                                </td>
                                <td class="text-end font-mono">
                                  {{ s.accuracy.toFixed(2) }}%
                                </td>
                                <td>
                                  <span v-if="s.mods.length" class="block px-2 mt-auto space-x-1 tooltip tooltip-primary" :data-tip="s.mods.map(m => StableMod[m]).join(', ')">
                                    <app-mod v-for="mod in s.mods" :key="mod" :mod="mod" class="w-5 h-5" />
                                  </span>
                                </td>
                                <td>{{ new Date(s.playedAt).toLocaleTimeString() }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <div v-else-if="!recent?.scores.length && pending">
      {{ t('loading') }}
    </div>
  </template>
</template>
