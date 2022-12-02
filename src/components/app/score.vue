<script setup lang="ts">
import { faBan } from '@fortawesome/free-solid-svg-icons'
import type { RankingSystemScore } from '~/types/score'
import type { Mode, RankingSystem, Ruleset } from '~/types/common'
import { ppRankingSystem, scoreRankingSystem } from '~/types/common'
import { createAddCommasFormatter } from '~~/src/common/varkaUtils'
import { useFAIconLib } from '#imports'
const props = withDefaults(
  defineProps<{
    score?: RankingSystemScore<unknown, unknown, Mode, RankingSystem>
    mode: Mode
    ruleset: Ruleset
    rankingSystem: RankingSystem
    useIntl?: boolean
  }>(),
  {
    useIntl: true,
  },
)
const { addToLibrary } = useFAIconLib()
addToLibrary(faBan)
const numberFmt = createAddCommasFormatter()
const beatmap = computed(() => {
  if (!props.score)
    return
  if (props.score.beatmap.status === 'notFound')
    return props.score.beatmap

  if (props.score.beatmap.status === 'deleted')
    return
  return props.score.beatmap
})
const meta = computed((): {
  artist: string
  title: string
} | void => {
  if (!beatmap.value)
    return
  if (beatmap.value.status === 'notFound')
    return

  if (props.useIntl) {
    return beatmap.value.beatmapset.meta.intl
  }

  else {
    return {
      artist: beatmap.value.beatmapset.meta.artist || beatmap.value.beatmapset.meta.intl.artist,
      title: beatmap.value.beatmapset.meta.title || beatmap.value.beatmapset.meta.intl.title,
    }
  }
})
</script>

<template>
  <!-- style="background: linear-gradient(hsl(var(--main,200 ), 25%, 25%, 0%), hsl(var(--main, 200), 25%, 25%, 90%)), url(https\:\/\/assets\.ppy\.sh\/beatmaps\/746506\/covers\/cover\.jpg);" -->
  <div v-if="score" class="score">
    <div class="flex justify-between">
      <div class="flex min-w-0 gap-4">
        <template v-if="beatmap">
          <div class="hidden md:block">
            <img
              v-if="beatmap.status !== 'notFound' && beatmap.beatmapset.source === 'bancho'"
              :src="`https://assets.ppy.sh/beatmaps/${beatmap.beatmapset.foreignId}/covers/list.jpg`"
              class="object-cover w-20 h-16 rounded-xl"
            >
            <div v-else class="w-20 h-16">
              <font-awesome-icon icon="fa-solid fa-ban" size="4x" />
            </div>
          </div>
        </template>
        <div class="flex flex-col min-w-0">
          <a href="#" class="text-sm truncate md:text-md lg:text-lg">
            <template v-if="beatmap && beatmap.status !== 'notFound' && meta">{{ meta.artist }} - {{ meta.title }} [{{
              beatmap.version
            }}]</template>
            <template v-else>
              Unknown Beatmap
            </template>
          </a>
          <div class="flex text-xs gap-2 md:text-sm lg:text-md">
            <div class="text-semibold">
              {{ score.mods.join(',') || 'noMod' }}
            </div>
            <div class="flex">
              <div class="font-semibold">
                {{ score.maxCombo }}
              </div>
              <div class="font-light">
                x
              </div>
            </div>
          </div>
          <div class="mt-auto map-date">
            <time class="text-xs italic lg:text-sm"> {{ score.playedAt.toLocaleDateString() }} {{
              score.playedAt.toLocaleTimeString()
            }} </time>
          </div>
        </div>
      </div>
      <div class="flex gap-4">
        <div class="flex flex-col">
          <div class="flex items-center justify-end flex-grow text-lg md:text-xl lg:text-2xl">
            <template v-if="(ppRankingSystem as readonly string[]).includes(props.rankingSystem)">
              <div class="font-bold font-mono">
                {{ score.pp.toFixed(2) }}
              </div>
              <span class="font-light">pp</span>
            </template>
            <template v-else-if="(scoreRankingSystem as readonly string[]).includes(props.rankingSystem)">
              <div class="font-bold font-mono">
                {{ numberFmt(score.score) }}
              </div>
            </template>
          </div>
          <div class="flex mt-auto text-xs md:text-md lg:text-md whitespace-nowrap">
            <b class="font-mono">{{ score.accuracy.toFixed(2) }}</b>
            <div class="text-light">
              % Acc
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center">
          <div class="text-5xl font-bold lg:text-6xl font-mono w-16 text-center">
            {{ score.grade }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.score + .score {
  @apply border-t-2 border-kimberly-300/50 pt-2
}
</style>
