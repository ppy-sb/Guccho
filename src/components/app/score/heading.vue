<script setup lang="ts">
import type { inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from '~/server/trpc/routers'
import type { RankingSystem } from '~/def/common'
import { Rank } from '~/def'

type RouterOutput = inferRouterOutputs<AppRouter>

type Score = NonNullable<RouterOutput['score']['id']>
defineProps<{
  score: Score
  rankingSystem: RankingSystem
}>()

const { hasRankingSystem, hasRuleset } = useAdapterConfig()

const scoreFmt = createScoreFormatter({ notation: undefined })
const { locale } = useI18n()
</script>

<i18n lang="yaml">
en-GB:
  title: '{title} by {artist}'
  map: '{version} created by {creator}'
  play: '{player} played at {time}'

zh-CN:
  title: "曲名\t\t\t{title}\n艺术家\t\t{artist}"
  map: "难度\t\t\t{version}\n谱师\t\t\t{creator}"
  play: '{player} 于 {time} 留下了此成绩'
</i18n>

<template>
  <!-- TODO score design -->
  <div v-if="beatmapIsVisible(score.beatmap)" class="whitespace-pre-wrap">
    <i18n-t keypath="title" tag="p" class="font-light">
      <template #title>
        <span class="text-3xl font-semibold">
          {{ autoLocale(score.beatmap.beatmapset.meta).title }}
        </span>
      </template>

      <template #artist>
        <span class="text-2xl font-normal">
          {{ autoLocale(score.beatmap.beatmapset.meta).artist }}
        </span>
      </template>
    </i18n-t>
    <i18n-t keypath="map" tag="p" class="font-light">
      <template #version>
        <span class="text-2xl font-semibold">{{ score.beatmap.version }}</span>
      </template>

      <template #creator>
        <span class="text-xl font-semibold">{{ score.beatmap.creator }}</span>
      </template>
    </i18n-t>

    <i18n-t keypath="play" tag="p" class="font-light pt-2">
      <template #player>
        <nuxt-link-locale
          class="align-bottom inline-flex"
          :to="{
            name: 'user-handle',
            params: {
              handle: `@${score.user.safeName}`,
            },
          }"
        >
          <img class="mask mask-squircle inline align-bottom" width="30" :src="score.user.avatarSrc" alt="user avatar">
          <div class="text-3xl font-normal underline decoration-sky-500">
            {{ score.user.name }}
          </div>
        </nuxt-link-locale>
      </template>

      <template #time>
        <span class="font-semibold underline decoration-dashed">
          {{ score.playedAt.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'full' }) }}
        </span>
      </template>
    </i18n-t>
  </div>
  <div class="flex flex-col md:flex-row w-full justify-between">
    <div class="p-8 flex gap-2 items-baseline">
      <template v-if="rankingSystem === Rank.Score">
        <span class="text-5xl">{{ scoreFmt(score.score) }}</span>
      </template>
      <template v-else-if="rankingSystem === Rank.PPv2 && hasRuleset(score.mode, score.ruleset) && hasRankingSystem(score.mode, score.ruleset, Rank.PPv2)">
        <span class="text-5xl">{{ scoreFmt(score[Rank.PPv2].pp) }}</span>
        <span class="text-3xl">{{ $t('global.pp') }}</span>
      </template>
    </div>
    <div class="p-8 text-8xl">
      {{ score.grade }}
    </div>
  </div>
</template>
