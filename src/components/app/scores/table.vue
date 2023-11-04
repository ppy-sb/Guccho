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
  },
)

const { t } = useI18n()

const comma = createNumberFormatter()
const pp = createPPFormatter()
</script>

<i18n lang="yaml">
en-GB:
  no-score: No Score has been set so far.
  actions: Actions
  detail: Detail
  replay: Replay

zh-CN:
  no-score: 目前还没有任何成绩。
  actions: 操作
  detail: 详情
  replay: 下载回放

fr-FR:
  no-score: Aucun score trouvé.
  actions: Actions
  detail: Detail
  replay: Replay
</i18n>

<template>
  <table class="table table-zebra">
    <thead>
      <tr>
        <th scope="col" class="text-right">
          {{ $t('global.rank') }}
        </th>
        <th scope="col">
          {{ $t('global.player') }}
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
        <th scope="col">
          {{ t('actions') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="props.scores.length">
        <tr v-for="(item, index) in props.scores" :key="index">
          <td class="text-right">
            #{{ index + 1 }}
          </td>
          <th scope="row">
            <div class="flex items-center space-x-3">
              <div class="avatar">
                <div class="mask mask-squircle w-8 h-8">
                  <img :src="item.user.avatarSrc" alt="avatar">
                </div>
              </div>
              <div>
                <nuxt-link-locale class="font-bold whitespace-nowrap" :class="useUserRoleColor(item.user)" :to="{ name: 'user-handle', params: { handle: `@${item.user.safeName}` } }">
                  {{ item.user.name }}
                </nuxt-link-locale>
                <!-- <div class="text-sm opacity-50 whitespace-nowrap">
                    {{ t(localeKey.country(item.user.flag || CountryCode.Unknown)) }}
                  </div> -->
              </div>
            </div>
          </th>
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
            {{ pp(item.score[Rank.PPv1] || 0) }}
          </td>
          <td class="font-mono">
            {{ item.score.playedAt.toLocaleDateString() }}
            {{ item.score.playedAt.toLocaleTimeString() }}
          </td>
          <td class="text-center">
            <div class="flex gap-2">
              <a :href="`/replay/${item.score.id}/download`" class="link link-hover">
                Replay <icon name="line-md:download-loop" class="w-4 h-4" />
              </a>
              <!-- TODO convert to model -->
              <nuxt-link-locale :to="`/score/${item.score.id}`" class="link link-hover">
                Detail <icon name="fa-solid:expand" class="w-4 h-4" />
              </nuxt-link-locale>
            </div>
          </td>
        </tr>
      </template>
      <template v-else>
        <tr>
          <th colspan="100" scope="row">
            <div class="text-center">
              {{ t('no-score') }}
            </div>
          </th>
        </tr>
      </template>
    </tbody>
  </table>
</template>
