<script setup lang="ts">
import type { RankingSystemScore } from '~/def/score'
import { StableMod } from '~/def/score'
import type { ActiveMode, ActiveRuleset, LeaderboardPPRankingSystem, LeaderboardRankingSystem, LeaderboardScoreRankingSystem } from '~/def/common'
import {
  Rank,
  leaderboardScoreRankingSystems,
  ppRankingSystems,
} from '~/def'

import { BeatmapSource, RankingStatus } from '~/def/beatmap'

const props = withDefaults(
  defineProps<{
    score: RankingSystemScore<string, string, ActiveMode, LeaderboardRankingSystem>
    mode: ActiveMode
    ruleset: ActiveRuleset
    rankingSystem: LeaderboardRankingSystem
    useIntl?: boolean
  }>(),
  {
    useIntl: true,
  }
)

const rankingStatusIconMapping: Partial<Record<RankingStatus, string>> = {
  [RankingStatus.Approved]: 'line-md:circle-to-confirm-circle-transition',
  [RankingStatus.Ranked]: 'line-md:chevron-small-triple-up',
  [RankingStatus.Pending]: 'line-md:alert',
  [RankingStatus.Loved]: 'line-md:heart-filled',
  [RankingStatus.Qualified]: 'line-md:confirm',
}

const numberFmt = createNumberFormatter()
const beatmap = computed(() => {
  if (!props.score || !beatmapIsVisible(props.score.beatmap)) {
    return
  }
  return props.score.beatmap
})
const meta = computed(
  (): {
    artist: string
    title: string
  } | void => {
    if (!beatmap.value) {
      return
    }
    if (!beatmapIsVisible(beatmap.value)) {
      return
    }

    if (props.useIntl) {
      return beatmap.value.beatmapset.meta.intl
    }
    else {
      return {
        artist:
          beatmap.value.beatmapset.meta.artist
          || beatmap.value.beatmapset.meta.intl.artist,
        title:
          beatmap.value.beatmapset.meta.title
          || beatmap.value.beatmapset.meta.intl.title,
      }
    }
  }
)

const { t, locale } = useI18n()
</script>

<i18n lang="yaml">
en-GB:
  unknown-beatmap: Unknown Beatmap

zh-CN:
  unknown-beatmap: 未知铺面
</i18n>

<template>
  <div class="score">
    <div class="flex justify-between hover-floating">
      <div class="flex min-w-0 gap-4">
        <div class="hidden md:block">
          <picture
            v-if="beatmap
              && beatmapIsVisible(beatmap)
              && beatmap.beatmapset.source === BeatmapSource.Bancho"
          >
            <source v-if="beatmap.beatmapset.assets['list@2x']" :srcset="`${beatmap.beatmapset.assets.list} 1x, ${beatmap.beatmapset.assets['list@2x']} 2x`">
            <img
              :src="beatmap.beatmapset.assets.list"
              :alt="autoLocale(beatmap.beatmapset.meta).title"
              :onerror="placeholder"
              class="object-cover w-20 h-16 rounded-xl shadow-md"
            >
          </picture>
          <div v-else class="w-20 h-16">
            <icon name="clarity:unknown-status-line" size="100%" />
          </div>
        </div>
        <div class="flex flex-col min-w-0">
          <template v-if="beatmap && beatmapIsVisible(beatmap)">
            <router-link
              :to="{
                name: 'beatmapset-id',
                params: {
                  id: beatmap.beatmapset.id as string,
                },
                query: {
                  beatmap: beatmap.id as string,
                  mode: props.mode,
                  ruleset: props.ruleset,
                  rank: [Rank.TotalScore, Rank.RankedScore].includes(
                    props.rankingSystem,
                  )
                    ? 'score'
                    : props.rankingSystem,
                },
              }" class="truncate"
            >
              <div v-if="meta" class="flex gap-2 items-center">
                <icon v-if="beatmap.status in rankingStatusIconMapping" :name="rankingStatusIconMapping[beatmap.status] as string" class="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6" :aria-label="beatmap.status" />
                <span class=" text-sm truncate md:text-md lg:text-lg font-bold">
                  {{ meta.artist }} - {{ meta.title }}
                </span>
              </div>
            </router-link>
          </template>
          <div v-else>
            {{ t('unknown-beatmap') }}
          </div>
          <div class="flex text-xs gap-2 md:text-sm lg:text-md flex-wrap">
            <span v-if="beatmap" class="font-semibold">
              {{ beatmap.version }}
            </span>
            <span v-if="score.mods.length" class="flex justify-end gap-1 tooltip tooltip-primary lg:tooltip-right" :data-tip="score.mods.map(m => StableMod[m]).join(', ')">
              <app-mod v-for="mod in score.mods" :key="mod" :mod="mod" class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </span>
          </div>
          <div class="mt-auto map-date">
            <time class="text-xs italic lg:text-sm font-extralight">
              {{ score.playedAt.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'full' }) }}
            </time>
          </div>
        </div>
      </div>
      <div class="flex gap-4">
        <div class="flex flex-col">
          <div class="flex items-center justify-end flex-grow text-lg md:text-xl lg:text-2xl">
            <template v-if="(ppRankingSystems).includes(props.rankingSystem as LeaderboardPPRankingSystem)">
              <div class="font-bold font-mono">
                {{ score.pp.toFixed(2) }}
              </div>
              <span class="font-light">{{ t('global.pp') }}</span>
            </template>
            <template v-else-if="(leaderboardScoreRankingSystems).includes(props.rankingSystem as LeaderboardScoreRankingSystem)">
              <div class="font-bold font-mono">
                {{ numberFmt(score.score) }}
              </div>
            </template>
          </div>
          <div class="flex gap-2 mt-auto text-sm md:text-md lg:text-md whitespace-nowrap justify-end">
            <span class="flex items-center">
              <template v-if="beatmap">
                <div class="font-semibold">
                  {{ score.maxCombo }}
                </div>
                <div class="font-light text-xs px-1">
                  /
                </div>
                <div>
                  {{ beatmap.properties.maxCombo }}
                </div>
              </template>
              <div v-else>
                {{ score.maxCombo }}
              </div>
              <div class="font-light">
                x
              </div>
            </span>

            <span class="flex">
              <b class="font-mono">{{ score.accuracy.toFixed(2) }}</b>
              <div class="text-light">
                % {{ t('global.acc') }}
              </div>
            </span>
          </div>
        </div>
        <div class="flex items-center justify-center">
          <div class="text-5xl font-mono w-16 text-center">
            {{ score.grade }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.score {
  @apply py-2;
}

.score + .score {
  @apply border-t-2 border-gbase-300/50;
}
</style>
