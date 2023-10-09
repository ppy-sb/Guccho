<script setup lang="ts">
import type { inferRouterOutputs } from '@trpc/server'

import type { RankingSystem } from '~/def/common'
import { Mode, Rank } from '~/def'
import type { ManiaHitCount, StandardHitCount } from '~/def/score'

import type { AppRouter } from '~/server/trpc/routers'

type RouterOutput = inferRouterOutputs<AppRouter>

type Score = NonNullable<RouterOutput['score']['id']>
defineProps<{
  score: Score
  rankingSystem: RankingSystem
}>()

const { hasRankingSystem, hasRuleset } = useAdapterConfig()

const { t } = useI18n()

const scoreFmt = createScoreFormatter({ notation: undefined })

function haveStandardHitCounts(input: Score): input is typeof input & { hit: StandardHitCount } {
  return input.mode !== Mode.Mania
}

function haveManiaHitCounts(input: Score): input is typeof input & { hit: ManiaHitCount } {
  return input.mode === Mode.Mania
}

const { locale } = useI18n()
</script>

<i18n lang="yaml">
en-GB:
  title: '{title} by {artist}'
  map: '{version} created by {creator}'
  play: '{player} played at {time}'
  download-replay: Download replay

zh-CN:
  title: "曲名\t\t\t{title}\n艺术家\t\t{artist}"
  map: "难度\t\t\t{version}\n谱师\t\t\t{creator}"
  play: '{player} 于 {time} 留下了此成绩'
  download-replay: 下载回放

fr-FR:
  title: '{title} par {artist}'
  map: '{version} créé par {creator}'
  play: '{player} joué le {time}'
  download-replay: Download replay
</i18n>

<template>
  <div v-if="beatmapIsVisible(score.beatmap)" class="whitespace-pre-wrap">
    <i18n-t keypath="title" tag="p" class="font-light">
      <template #title>
        <nuxt-link-locale
          :to="{ name: 'beatmapset-id', params: { id: score.beatmap.beatmapset.id }, query: { mode: score.mode } }"
          class="text-3xl font-semibold underline decoration-sky-500"
        >
          {{ autoLocale(score.beatmap.beatmapset.meta).title }}
        </nuxt-link-locale>
      </template>

      <template #artist>
        <span class="text-2xl font-normal">
          {{ autoLocale(score.beatmap.beatmapset.meta).artist }}
        </span>
      </template>
    </i18n-t>
    <i18n-t keypath="map" tag="p" class="font-light">
      <template #version>
        <nuxt-link-locale
          class="text-2xl font-semibold underline decoration-sky-500"
          :to="{ name: 'beatmapset-id', params: { id: score.beatmap.beatmapset.id }, query: { beatmap: score.beatmap.md5, mode: score.mode } }"
        >
          {{ score.beatmap.version }} (*{{ score.beatmap.properties.starRate }})
        </nuxt-link-locale>
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
  <div class="flex flex-col md:flex-row w-full justify-between items-center">
    <div class="flex flex-col gap-2 items-baseline flex-grow">
      <div>
        <template v-if="rankingSystem === Rank.Score">
          <span class="text-5xl">{{ scoreFmt(score.score) }}</span>
        </template>
        <template v-else-if="rankingSystem === Rank.PPv2 && hasRuleset(score.mode, score.ruleset) && hasRankingSystem(score.mode, score.ruleset, Rank.PPv2)">
          <span class="text-5xl">{{ scoreFmt(score[Rank.PPv2].pp) }}</span>
          <span class="text-3xl">{{ $t('global.pp') }}</span>
        </template>
      </div>
      <div v-if="haveManiaHitCounts(score)" class="grid gap-4 grid-flow-row grid-cols-2 w-full">
        <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[300]) }}</span>x 300</div> <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit.max) }}</span>x 300p</div>
        <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[200]) }}</span>x 200</div> <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[100]) }}</span>x 100</div>
        <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[50]) }}</span>x 50</div> <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit.miss) }}</span>x miss</div>
      </div>
      <div v-else-if="haveStandardHitCounts(score)" class="grid gap-4 grid-flow-row grid-cols-2 w-full">
        <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[300]) }}</span>x 300</div> <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit.geki) }}</span>x geki</div>
        <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[100]) }}</span>x 100</div> <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit.katu) }}</span>x katu</div>
        <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit[50]) }}</span>x 50</div> <div><span class="text-4xl font-mono">{{ scoreFmt(score.hit.miss) }}</span>x miss</div>
      </div>
      <div>Accuracy {{ score.accuracy }} %</div>
    </div>
    <div class="text-8xl">
      {{ score.grade }}
    </div>
  </div>
  <div>
    <a :href="`/replay/${score.id}/download`" class="btn btn-shadow btn-primary">{{ t('download-replay') }} <icon name="line-md:download-loop" class="w-5 h-5" /></a>
  </div>
</template>
