<script setup lang="ts">
import draggable from 'vuedraggable'
import { StableMod } from '~/def/score'
import {
  CompareOP,
  type ComparisonCondition,
  type Cond,
  OP,
  Requirement,
  type RequirementCondBinding,
  type WrappedCond,
} from '~/def/dan'
import { modes, rulesets } from '~/def'

const props = withDefaults(defineProps<{
  listMode?: boolean
  disabled?: boolean
  requirements: readonly RequirementCondBinding<Requirement, Cond>[]
  currentIdx: number
  parent: Cond | null
}>(), { listMode: false, disabled: false })

const emit = defineEmits<{
  (e: 'delete'): void
}>()

const mods = [
  [StableMod.Easy, StableMod.NoFail, StableMod.HalfTime],
  [StableMod.HardRock, StableMod.SuddenDeath, StableMod.DoubleTime, StableMod.Hidden, StableMod.Flashlight],
  [null, StableMod.Perfect, StableMod.Nightcore, StableMod.FadeIn],
  [StableMod.Relax, StableMod.Autopilot, StableMod.SpunOut, null, StableMod.ScoreV2],
  [null, StableMod.KeyCoop, StableMod.Mirror, StableMod.Random],
]
const keys = [
  StableMod['1K'],
  StableMod['2K'],
  StableMod['3K'],
  StableMod['4K'],
  StableMod['5K'],
  StableMod['6K'],
  StableMod['7K'],
  StableMod['8K'],
  StableMod['9K'],
]

const tRequirement = localeKey.root.dan.requirement

const cond = defineModel<Cond>()

interface Translation {
  dan: {
    cond: Record<OP, string>
    not?: Partial<Record<OP, string>>
    cmp: Record<CompareOP, string>
    requirement: Record<Requirement, string>
    key: {
      mode: string
      ruleset: string
      accuracy: string
      maxCombo: string
      score: string
      count: {
        miss: string
        50: string
        100: string
        300: string
        geki: string
        katu: string
        200: string
        max: string
      }
    }
  }
}

// TODO fr-FR
// TODO de-DE
const { t, te } = useI18n({
  messages: {
    'en-GB': {
      dan: {
        requirement: {
          [Requirement.Pass]: 'Pass',
          [Requirement.NoPause]: 'No Pause',
        },
        cond: {
          [OP.AccGte]: 'Accuracy ≥',
          [OP.ScoreGte]: 'Score ≥',
          [OP.ModeEq]: 'Mode =',
          [OP.RulesetEq]: 'Rule =',
          [OP.BanchoBeatmapIdEq]: 'Bancho bid =',
          [OP.BeatmapMd5Eq]: 'Beatmap MD5 =',
          [OP.StableModIncludeAny]: 'Played with any Mod',
          [OP.StableModIncludeAll]: 'Played with all Mod',
          [OP.Extends]: 'meet all requirements in',
          [OP.OR]: 'or',
          [OP.AND]: 'and',
          [OP.NOT]: 'not',
          [OP.Remark]: 'Remark',
          [OP.NoPause]: 'No Pause',
          [OP.Expect]: 'Should',
        },
        cmp: {
          [CompareOP.Gt]: '>',
          [CompareOP.Gte]: '≥',
          [CompareOP.Lt]: '<',
          [CompareOP.Lte]: '≤',
          [CompareOP.Eq]: '=',
          [CompareOP.Ne]: '≠',
        },
        key: {
          mode: '@:global.mode',
          ruleset: '@:global.ruleset',
          accuracy: '@:global.accuracy',
          maxCombo: '@:global.max-combo',
          score: 'Score',
          count: {
            miss: 'Miss',
            50: '50',
            100: '100',
            300: '300',
            geki: 'Geki',
            katu: 'Katu',
            200: '200',
            max: 'Max',
          },
        },
      },
    },
    'zh-CN': {
      dan: {
        requirement: {
          [Requirement.Pass]: 'Pass',
          [Requirement.NoPause]: '无暂停',
        },
        cmp: {
          [CompareOP.Gt]: '>',
          [CompareOP.Gte]: '≥',
          [CompareOP.Lt]: '<',
          [CompareOP.Lte]: '≤',
          [CompareOP.Eq]: '=',
          [CompareOP.Ne]: '≠',
        },
        cond: {
          [OP.AccGte]: 'ACC ≥',
          [OP.ScoreGte]: '分数 ≥',
          [OP.ModeEq]: '模式 =',
          [OP.RulesetEq]: '玩法 =',
          [OP.BanchoBeatmapIdEq]: 'Bancho 的 bid =',
          [OP.BeatmapMd5Eq]: 'Beatmap MD5 =',
          [OP.StableModIncludeAny]: '至少加一个 Mod',
          [OP.StableModIncludeAll]: '加全部 Mod',
          [OP.Extends]: '符合另一判定的所有条件',
          [OP.OR]: '满足其中一项',
          [OP.AND]: '满足所有条件',
          [OP.NOT]: '不可',
          [OP.Remark]: '备注',
          [OP.NoPause]: '无暂停',
          [OP.Expect]: '判断',
        },
        not: {
          [OP.StableModIncludeAny]: '加列表中的任何 Mod',
          [OP.StableModIncludeAll]: '加特定 Mod 组合',
        },
        key: {
          mode: '@:global.mode',
          ruleset: '@:global.ruleset',
          accuracy: '@:global.accuracy',
          maxCombo: '@:global.max-combo',
          score: '分数',
          count: {
            miss: 'Miss 的数量',
            50: '50 的数量',
            100: '100 的数量',
            300: '300 的数量',
            geki: 'Geki 的数量',
            katu: 'Katu 的数量',
            200: '200 的数量',
            max: 'Max 的数量',
          },
        },
      },
    },
  } satisfies Record<string, Translation>,
})

// const comparisonKeys = ['mode', 'ruleset', 'accuracy', 'maxCombo', 'count.miss', 'count.50', 'count.100', 'count.300', 'count.geki', 'count.katu', 'count.200', 'count.max', 'score'] as ComparisonCondition['key'][]
const numericalKeys = ['score', 'accuracy', 'maxCombo', 'count.miss', 'count.50', 'count.100', 'count.300', 'count.geki', 'count.katu', 'count.200', 'count.max'] as ComparisonCondition['key'][]
// const nonNumericalKeys = ['mode', 'ruleset']
const nonNumericalComparionOPs = [CompareOP.Eq, CompareOP.Ne]
const numericalComparisonOPs = [CompareOP.Gt, CompareOP.Gte, CompareOP.Lt, CompareOP.Lte, ...nonNumericalComparionOPs]

const drag = ref(false)
const current = computed(() => props.requirements[props.currentIdx])

const ops = Object.values(OP)

function onSelectKey() {
  // if (cond.value?.type !== OP.Compare) {

  // }
}

async function selectCond() {
  if (!cond.value) {
    return
  }

  if (cond.value.type === OP.AND || cond.value.type === OP.OR) {
    cond.value.cond = []
  }
  else if (cond.value.type === OP.NOT) {
    if (Array.isArray(cond.value.cond)) {
      cond.value.cond = {
        type: OP.AND,
        cond: cond.value.cond,
      }
    }
  }
  else if (cond.value.type === OP.Expect) {
    cond.value.val = {} as any
  }
}
function resetCond() {
  cond.value = undefined
}

async function initCond(op: OP) {
  cond.value = {
    type: op,
  } as Cond
  await nextTick()
  selectCond()
}
</script>

<i18n lang="yaml">
en-GB:
  reset: Reset
  delete: Delete
  select: Select
  add: Add

zh-CN:
  reset: 重置
  delete: 删除
  select: 选择
  add: 添加
</i18n>

<template>
  <template v-if="cond?.type">
    <div
      class="relative flex gap-1 dan-cond-row group"
      :class="{
        'opacity-60': disabled,
        'dragging': drag,
      }"
    >
      <span
        v-if="listMode"
        class="drag-handle mt-1.5 flex items-top justify-center text-base-content/60 cursor-grab active:cursor-grabbing select-none"
        title="Drag to reorder"
      >
        <icon name="mdi:drag" class="text-lg" />
      </span>
      <div class="flex flex-wrap flex-1 min-w-0 gap-1">
        <!-- Main select for OP type -->
        <div
          :class=" {
            'w-full flex items-center gap-2': cond.type === OP.AND || cond.type === OP.OR || cond.type === OP.NOT,
          }"
        >
          <select
            v-model="cond.type"
            :disabled="disabled"
            name="cond"
            class="select select-sm bg-base-200"
            :class=" {
              grow: cond.type === OP.AND || cond.type === OP.OR || cond.type === OP.NOT,
            }"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="op in ops" :key="op" :value="op">
              {{
                parent?.type === OP.NOT && te(`dan.not.${op}`)
                  ? t(`dan.not.${op}`)
                  : t(`dan.cond.${op}`)
              }}
            </option>
          </select>
          <button v-if="cond.type === OP.AND || cond.type === OP.OR" class="btn btn-sm btn-circle btn-success btn-outline" @click="(cond.cond as any).push(undefined)">
            <icon name="material-symbols:add-rounded" />
          </button>
        </div>

        <!-- OP.Expect: key, cmp, value -->
        <template v-if="cond.type === OP.Expect">
          <select
            v-model="cond.key"
            :disabled="disabled"
            name="key"
            class="select select-sm bg-base-200 grow"
            @change="onSelectKey"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="key in numericalKeys" :key="key" :value="key">
              {{ t(`dan.key.${key}`) }}
            </option>
          </select>
          <template v-if="cond.val">
            <select
              v-model="cond.val.type"
              :disabled="disabled"
              name="cmp"
              class="select select-sm bg-base-200 grow"
              @change="onSelectKey"
            >
              <option disabled value="">
                {{ t('select') }}
              </option>
              <template v-if="numericalKeys.includes(cond.key)">
                <option v-for="op in numericalComparisonOPs" :key="op" :value="op">
                  {{ t(`dan.cmp.${op}`) }}
                </option>
              </template>
              <template v-else>
                <option v-for="op in nonNumericalComparionOPs" :key="op" :value="op">
                  {{ t(`dan.cond.${op}`) }}
                </option>
              </template>
            </select>
            <input
              v-model.lazy="cond.val.val"
              class="input input-sm bg-base-200 grow"
              :disabled="disabled"
              :type="numericalKeys.includes(cond.key) ? 'number' : 'text'"
              style="width: 6rem;"
            >
          </template>
        </template>

        <!-- OP.NoPause: no extra controls -->
        <template v-else-if="cond.type === OP.NoPause">
          <span class="italic text-base-content/60">{{ t('dan.requirement.NoPause') }}</span>
        </template>

        <!-- OP.ModeEq, OP.RulesetEq, OP.Extends -->
        <template v-else-if="cond.type === OP.ModeEq">
          <select
            v-model="cond.val"
            :disabled="disabled"
            name="mode"
            class="select select-sm bg-base-200 grow"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="m in modes" :key="m" :value="m">
              {{ m }}
            </option>
          </select>
        </template>
        <template v-else-if="cond.type === OP.RulesetEq">
          <select
            v-model="cond.val"
            :disabled="disabled"
            name="ruleset"
            class="select select-sm bg-base-200 grow"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="r in rulesets" :key="r" :value="r">
              {{ r }}
            </option>
          </select>
        </template>
        <template v-else-if="cond.type === OP.Extends">
          <select
            v-model="cond.val"
            :disabled="disabled"
            name="extends"
            class="select select-sm bg-base-200 grow"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option
              v-for="ach in Object.values(Requirement).filter(ach => requirements.some(r => r.type === ach) && ach !== current.type)"
              :key="ach"
              :value="ach"
            >
              {{ t(tRequirement[ach].__path__) }}
            </option>
          </select>
        </template>

        <!-- OP.StableModIncludeAny, OP.StableModIncludeAll: mod checkboxes -->
        <template v-else-if="cond.type === OP.StableModIncludeAny || cond.type === OP.StableModIncludeAll">
          <div class="w-full mod-grid">
            <template v-for="(row, rn) in mods" :key="rn">
              <template
                v-for="(mod, idx) in row"
                :key="`${rn}${idx}`"
              >
                <label
                  v-if="mod"
                  class="mod-item"
                  :class="{
                    'bg-primary/20 border-primary': !!((cond.val as number) & mod),
                    'border-base-300': !((cond.val as number) & mod),
                    'col-start-1': idx === 0,
                  }"
                  :title="mod ? StableMod[mod] : ''"
                  @click="cond.val = (cond.val as number) ^ mod"
                >
                  <app-mod :mod="mod" class="mb-1 text-2xl" />
                  <span class="text-xs">{{ StableMod[mod] }}</span>
                </label>
                <label v-else />
              </template>
            </template>
          </div>
          <div class="flex w-full gap-1">
            <label
              v-for="mod in keys"
              :key="mod"
              class="flex items-center justify-center p-2 transition border rounded cursor-pointer grow mod-item hover:bg-base-200"
              :class="{
                'bg-primary/20 border-primary': !!((cond.val as number) & mod),
                'border-base-300': !((cond.val as number) & mod),
              }"
              :title="mod ? StableMod[mod] : ''"
              @click="cond.val = (cond.val as number) ^ mod"
            >
              <app-mod :mod="mod" class="mb-1 text-2xl" />
              <span class="text-xs">{{ StableMod[mod] }}</span>
            </label>
          </div>
        </template>

        <!-- Compound/nested: AND, OR, NOT, Remark -->
        <template v-else-if="cond.type === OP.AND || cond.type === OP.OR || cond.type === OP.NOT || cond.type === OP.Remark">
          <div class="flex-1">
            <div v-if="cond.type === OP.Remark || cond.type === OP.NOT" class="">
              <app-dan-cond
                v-model.lazy="cond.cond"
                :requirements="requirements"
                :current-idx="currentIdx"
                :parent="cond"
                @delete="cond = undefined"
              />
            </div>
            <draggable
              v-else-if="cond.type === OP.AND || cond.type === OP.OR"
              v-model.lazy="cond.cond as unknown[]"
              class="flex flex-col gap-1"
              animation="200"
              group="description"
              ghost-class="ghost"
              handle=".drag-handle"
              :item-key="(i?: WrappedCond<OP, Cond>) => i?.cond || 'n'"
              @start="drag = true"
              @end="drag = false"
            >
              <template #item="{ index }">
                <div class="border-l-2 rounded ps-1 border-base-300 bg-base-200/20">
                  <app-dan-cond
                    v-model.lazy="cond.cond[index]"
                    :list-mode="true"
                    :requirements="requirements"
                    :current-idx="currentIdx"
                    :parent="cond"
                    @delete="(cond.cond as Cond[]).splice(index, 1)"
                  />
                </div>
              </template>
            </draggable>
          </div>
        </template>

        <!-- Simple value: AccGte, ScoreGte, BanchoBeatmapIdEq, BeatmapMd5Eq -->
        <template v-else-if="cond.type === OP.AccGte || cond.type === OP.ScoreGte">
          <input
            v-model.lazy="cond.val"
            class="input input-sm bg-base-200 grow"
            :disabled="disabled"
            type="number"
          >
        </template>
        <template v-else-if="cond.type === OP.BanchoBeatmapIdEq || cond.type === OP.BeatmapMd5Eq">
          <input
            v-model.lazy="cond.val"
            class="input input-sm bg-base-200 grow"
            :disabled="disabled"
            type="text"
            style="width: 10rem;"
          >
        </template>

        <!-- Fallback for unreachable -->
        <template v-else>
          <span class="text-error">{{ assertNotReachable(cond) }}</span>
        </template>
      </div>
      <!-- Action buttons -->
      <div class="flex gap-1">
        <button v-if="listMode" :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
          <icon name="material-symbols:delete" />
        </button>
        <button v-else :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
          <icon name="lsicon:clear-filled" />
        </button>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex items-center gap-2 rounded-lg dan-cond-row">
      <select
        value=""
        :disabled="disabled"
        name="cond"
        class="select select-sm bg-base-200 grow"
        @change="v => initCond((v.target as any).value)"
      >
        <option disabled value="">
          {{ t('select') }}
        </option>
        <option v-for="op in ops" :key="op" :value="op">
          {{ t(`dan.cond.${op}`) }}
        </option>
      </select>
      <div class="flex-1" />
      <button v-if="listMode" :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
        <icon name="material-symbols:delete" />
      </button>
      <button v-else :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
        <icon name="lsicon:clear-filled" />
      </button>
    </div>
  </template>
</template>

<style scoped lang="postcss">
.dan-cond-row {
  @apply transition rounded ease-in;
}
.drag-handle {
  @apply text-base-content/40 hover:text-primary cursor-grab active:cursor-grabbing;
}
.dan-cond-row.dragging {
  @apply ring-2 ring-primary/50 ring-offset-4 ring-offset-base-200 shadow-lg;
}
.mod-grid {
  @apply grid gap-1 grid-cols-5;
}
.mod-item {
  @apply flex flex-col items-center justify-center p-2 rounded cursor-pointer border transition;
}
</style>
