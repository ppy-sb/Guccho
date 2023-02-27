<script setup lang="ts">
// @ts-expect-error There's no such declaration file for me to include, nor do I felt to declare it myself. It's a Vue SFC How do you expecting me to declare it myself... by hand? Are you really respecting my time?
import VLazyImage from 'v-lazy-image'
import {
  faBan,
  faCheckDouble,
  faHeart,
  faPause,
} from '@fortawesome/free-solid-svg-icons'
import type { RankingSystemScore } from '~/types/score'
import type { LeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'
import {
  leaderboardScoreRankingSystems,
  ppRankingSystems,
} from '~/types/defs'
import { createAddCommasFormatter } from '~/common/varkaUtils'
import { useFAIconLib } from '#imports'
import { assertBeatmapIsVisible } from '~/utils/map'
import { placeholder } from '~/utils'
import type { RankingStatus } from '~/types/beatmap'
const props = withDefaults(
  defineProps<{
    score?: RankingSystemScore<
      unknown,
      unknown,
      Mode,
      LeaderboardRankingSystem
    >
    mode: Mode
    ruleset: Ruleset
    rankingSystem: LeaderboardRankingSystem
    useIntl?: boolean
  }>(),
  {
    useIntl: true,
  },
)
const { addToLibrary } = useFAIconLib()
addToLibrary(faBan, faCheckDouble, faHeart, faPause)

const rankingStatusIconMapping: Partial<Record<RankingStatus, string>> = {
  approved: 'fa-solid fa-check-double',
  ranked: 'fa-solid fa-ranking-star',
  pending: 'fa-solid fa-pause',
  loved: 'fa-solid fa-heart',
  qualified: 'fa-solid fa-fa-check-double',
}

const numberFmt = createAddCommasFormatter()
const beatmap = computed(() => {
  if (!props.score) {
    return
  }
  if (!assertBeatmapIsVisible(props.score.beatmap)) {
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
    if (!assertBeatmapIsVisible(beatmap.value)) {
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
  },
)
</script>

<template>
  <!-- style="background: linear-gradient(hsl(var(--main,200 ), 25%, 25%, 0%), hsl(var(--main, 200), 25%, 25%, 90%)), url(https\:\/\/assets\.ppy\.sh\/beatmaps\/746506\/covers\/cover\.jpg);" -->
  <div v-if="score" class="score">
    <div class="flex justify-between">
      <div class="flex min-w-0 gap-4">
        <div class="hidden md:block">
          <VLazyImage
            v-if="
              beatmap
                && assertBeatmapIsVisible(beatmap)
                && beatmap.beatmapset.source === 'bancho'
            " class="object-cover w-20 h-16 rounded-xl" src-placeholder="/images/image-placeholder.svg"
            :src="`https://assets.ppy.sh/beatmaps/${beatmap.beatmapset.foreignId}/covers/list.jpg`" alt="list"
            :onerror="placeholder"
          />
          <div v-else class="w-20 h-16">
            <font-awesome-icon icon="fa-solid fa-ban" size="4x" class="w-full" />
          </div>
        </div>
        <div class="flex flex-col min-w-0">
          <template v-if="beatmap && assertBeatmapIsVisible(beatmap)">
            <router-link
              :to="{
                name: 'beatmapset-id',
                params: {
                  id: beatmap.beatmapset.id,
                },
                query: {
                  beatmap: beatmap.id,
                  mode: props.mode,
                  ruleset: props.ruleset,
                  rank: ['totalScore', 'rankedScore'].includes(
                    props.rankingSystem,
                  )
                    ? 'score'
                    : props.rankingSystem,
                },
              }" class="truncate"
            >
              <template v-if="meta">
                <span class="text-sm truncate md:text-md lg:text-lg font-bold flex gap-2 items-center">
                  <font-awesome-icon v-if="rankingStatusIconMapping[beatmap.status]" :icon="rankingStatusIconMapping[beatmap?.status]" class="opacity-50" :aria-label="beatmap.status" />
                  {{ meta.artist }} - {{ meta.title }}</span>
              </template>
            </router-link>
          </template>
          <div v-else>
            Unknown Beatmap
          </div>
          <div class="flex text-xs gap-2 md:text-sm lg:text-md flex-wrap">
            <div class="flex gap-2">
              <span v-if="beatmap" class="font-semibold">
                {{ beatmap.version }}
              </span>
              <span class="font-light">
                {{ score.mods.join(", ") || "NoMod" }}
              </span>
            </div>
            <div class="flex">
              <div v-if="beatmap" class="font-semibold">
                {{ score.maxCombo }} / {{ beatmap.properties.maxCombo }}
              </div>
              <div v-else class="font-semibold">
                {{ score.maxCombo }}
              </div>
              <div class="font-light">
                x
              </div>
            </div>
          </div>
          <div class="mt-auto map-date">
            <time class="text-xs italic lg:text-sm font-extralight">
              {{ score.playedAt.toLocaleString() }}
            </time>
          </div>
        </div>
      </div>
      <div class="flex gap-4">
        <div class="flex flex-col">
          <div class="flex items-center justify-end flex-grow text-lg md:text-xl lg:text-2xl">
            <template v-if="(ppRankingSystems as readonly string[]).includes(props.rankingSystem)">
              <div class="font-bold font-mono">
                {{ score.pp.toFixed(2) }}
              </div>
              <span class="font-light">pp</span>
            </template>
            <template v-else-if="(leaderboardScoreRankingSystems as readonly string[]).includes(props.rankingSystem)">
              <div class="font-bold font-mono">
                {{ numberFmt(score.score) }}
              </div>
            </template>
          </div>
          <div class="flex mt-auto text-xs md:text-md lg:text-md whitespace-nowrap justify-end">
            <b class="font-mono">{{ score.accuracy.toFixed(2) }}</b>
            <div class="text-light">
              % Acc
            </div>
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
  @apply border-t-2 border-kimberly-300/50;
}
</style>
