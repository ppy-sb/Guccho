<script setup lang="ts">
import { StableMod } from '~/def/score'
import type { RankingSystem } from '~/def/common'
import { Rank } from '~/def'
import type { BeatmapLeaderboard } from '~/def/leaderboard'

const props = withDefaults(
  defineProps<{
    scores: BeatmapLeaderboard<string>[]
    rankingSystem: RankingSystem
  }>(),
  {
    rankingSystem: Rank.PPv2,
  }
)

const { t } = useI18n()

const comma = createNumberFormatter()
const pp = createPPFormatter()
</script>

<i18n lang="yaml">
en-GB:
  no-score: No Score has been set so far.
  actions: Actions

zh-CN:
  no-score: 目前还没有任何成绩。
  actions: 操作
</i18n>

<template>
  <table class="table table-compact table-zebra">
    <thead>
      <tr>
        <th scope="col">
          {{ $t('global.player') }}
        </th>
        <th scope="col" class="text-right">
          {{ $t('global.rank') }}
        </th>
        <th scope="col" class="text-right">
          {{ $t('global.mods') }}
        </th>
        <th scope="col" class="text-right">
          {{ $t(localeKey.rankingSystem(Rank.Score)) }}
        </th>
        <th v-if="rankingSystem !== Rank.Score" scope="col" class="text-right">
          {{ $t(localeKey.rankingSystem(rankingSystem)) }}
        </th>
        <th scope="col">
          {{ $t('global.played-at') }}
        </th>
        <th scope="col" class="text-center">
          {{ t('actions') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="props.scores.length">
        <tr v-for="(item, index) in props.scores" :key="index">
          <th scope="row">
            <div class="flex gap-2 items-center">
              <div class="aspect-square mask mask-squircle flex">
                <img
                  class="m-auto"
                  :src="item.user.avatarSrc"
                  :alt="item.user.name"
                  width="30"
                >
              </div>
              <nuxt-link-locale
                :to="{
                  name: 'user-handle',
                  params: { handle: item.user.safeName },
                }"
                :class="useUserRoleColor(item.user)"
              >
                {{ item.user.name }}
              </nuxt-link-locale>
            </div>
          </th>
          <td class="text-right">
            #{{ index + 1 }}
          </td>
          <td class="flex justify-end gap-1 tooltip tooltip-primary lg:tooltip-right" :data-tip="item.score.mods.map(m => StableMod[m]).join(', ')">
            <app-mod v-for="mod in item.score.mods" :key="mod" :mod="mod" class="w-6 h-6" />
          </td>
          <td class="text-right font-mono">
            {{ comma(item.score.score) }}
          </td>
          <td v-if="rankingSystem === Rank.PPv2" class="text-right font-mono">
            {{ pp(item.score[Rank.PPv2] || 0) }}
          </td>
          <td v-else-if="rankingSystem === Rank.PPv1" class="text-right font-mono">
            {{ pp(item.score[Rank.PPv2] || 0) }}
          </td>
          <td class="font-mono">
            {{ item.score.playedAt.toLocaleDateString() }}
            {{ item.score.playedAt.toLocaleTimeString() }}
          </td>
          <td class="text-center">
            <div class="btn-group">
              <a :href="`/replay/${item.score.id}/download`" class="btn btn-ghost btn-sm align-middle">
                Replay <icon name="line-md:download-loop" class="w-4 h-4" />
              </a>
              <nuxt-link-locale :to="`/score/${item.score.id}`" class="btn btn-ghost btn-sm align-middle">
                Detail <icon name="fa-solid:expand" class="w-4 h-4" />
              </nuxt-link-locale>
            </div>
          </td>
        </tr>
      </template>
      <template v-else>
        <tr>
          <th colspan="6" scope="row">
            <div class="text-center">
              {{ t('no-score') }}
            </div>
          </th>
        </tr>
      </template>
    </tbody>
  </table>
</template>
