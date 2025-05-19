<script setup lang="ts">
import { $enum } from 'ts-enum-util'
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

withDefaults(defineProps<{
  listMode?: boolean
  disabled?: boolean
  requirements: readonly RequirementCondBinding<Requirement, Cond>[]
  current: RequirementCondBinding<Requirement, Cond>
}>(), { listMode: false, disabled: false })

const emit = defineEmits<{
  (e: 'delete'): void
}>()

const tRequirement = localeKey.root.dan.requirement

const cond = defineModel<Cond>()

interface Translation {
  dan: {
    cond: Record<OP, string>
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
const { t } = useI18n({
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
          [OP.NOT]: '不是',
          [OP.Remark]: '备注',
          [OP.NoPause]: '无暂停',
          [OP.Expect]: '判断',
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

const ops = Object.values(OP)

function onSelectKey() {
  // if (cond.value?.type !== OP.Compare) {

  // }
}

function selectCond() {
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
  <div
    class="grid grid-cols-12 col-span-12 gap-2 p-1 border rounded-r bg-base-200 border-base-300"
  >
    <template v-if="cond?.type">
      <div
        :class="{
          'col-span-6 md:col-span-3': cond.type !== OP.Expect,
          'col-span-4 sm:col-span-2': cond.type === OP.Expect,
          // 'col-span-6 md:col-span-3': cond.type === OP.StableModIncludeAny || cond.type === OP.StableModIncludeAll,
        }"
      >
        <div class="form-control">
          <select
            v-model="cond.type"
            :disabled="disabled"
            name="cond"
            class="select select-sm"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="op in ops" :key="op" :value="op">
              {{ t(`dan.cond.${op}`) }}
            </option>
          </select>
        </div>
      </div>
      <template v-if="cond.type === OP.Expect">
        <div class="col-span-5 sm:col-span-3 md:col-span-2 form-control">
          <select
            v-model="cond.key"
            :disabled="disabled"
            name="key"
            class="select select-sm"
            @change="onSelectKey"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option
              v-for="key in numericalKeys"
              :key="key"
              :value="key"
            >
              {{ t(`dan.key.${key}`) }}
            </option>
          </select>
        </div>
        <template v-if="cond.val">
          <div class="col-span-3 sm:col-span-2 form-control">
            <select
              v-model="cond.val.type"
              :disabled="disabled"
              name="key"
              class="select select-sm"
              @change="onSelectKey"
            >
              <option disabled value="">
                {{ t('select') }}
              </option>
              <template v-if="numericalKeys.includes(cond.key)">
                <option
                  v-for="op in numericalComparisonOPs"
                  :key="op"
                  :value="op"
                >
                  {{ t(`dan.cmp.${op}`) }}
                </option>
              </template>
              <template v-else>
                <option
                  v-for="op in nonNumericalComparionOPs"
                  :key="op"
                  :value="op"
                >
                  {{ t(`dan.cond.${op}`) }}
                </option>
              </template>
            </select>
          </div>
          <div class="col-span-11 sm:col-span-4 md:col-span-5 form-control">
            <input
              v-model.lazy="cond.val.val"
              class="input input-sm"
              :disabled="disabled"
              :type="numericalKeys.includes(cond.key) ? 'number' : 'text'"
            >
          </div>
          <div v-if="listMode" class="flex justify-end col-span-1">
            <button :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
              <icon name="material-symbols:delete" />
            </button>
          </div>
          <div v-else class="flex justify-end col-span-1">
            <button :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
              <icon name="lsicon:clear-filled" />
            </button>
          </div>
        </template>
      </template>
      <template v-else-if="cond.type === OP.NoPause">
        <div class="col-span-5 md:col-span-8" />
        <div v-if="listMode" class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
            <icon name="material-symbols:delete" />
          </button>
        </div>
        <div v-else class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
            <icon name="lsicon:clear-filled" />
          </button>
        </div>
      </template>
      <template v-else-if=" cond.type === OP.ModeEq || cond.type === OP.RulesetEq || cond.type === OP.Extends">
        <div v-if="cond.type === OP.ModeEq" class="col-span-5 md:col-span-3 form-control">
          <select
            v-model="cond.val"
            :disabled="disabled"
            name="mode"
            class="select select-sm"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="m in modes" :key="m" :value="m">
              {{ m }}
            </option>
          </select>
        </div>
        <div v-else-if="cond.type === OP.RulesetEq" class="col-span-5 md:col-span-3 form-control">
          <select
            v-model="cond.val"
            :disabled="disabled"
            name="mode"
            class="select select-sm"
            @change="selectCond"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="r in rulesets" :key="r" :value="r">
              {{ r }}
            </option>
          </select>
        </div>

        <div v-else-if="cond.type === OP.Extends" class="col-span-5 md:col-span-3 form-control">
          <select
            v-model="cond.val"
            :disabled="disabled"
            name="mode"
            class="select select-sm"
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
        </div>

        <div class="hidden md:block md:col-span-5" />

        <div v-if="listMode" class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
            <icon name="material-symbols:delete" />
          </button>
        </div>
        <div v-else class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
            <icon name="lsicon:clear-filled" />
          </button>
        </div>
      </template>
      <template v-else-if="cond.type === OP.StableModIncludeAny || cond.type === OP.StableModIncludeAll">
        <div class="col-span-5 md:col-span-8" />
        <div v-if="listMode" class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
            <icon name="material-symbols:delete" />
          </button>
        </div>
        <div v-else class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
            <icon name="lsicon:clear-filled" />
          </button>
        </div>
        <div class="grid grid-cols-12 col-span-12 gap-0 gap-x-6">
          <div v-for="mod in $enum(StableMod).getValues()" :key="mod" class="col-span-6 md:col-span-3 form-control">
            <label class="cursor-pointer label">
              <span class="label-text">{{ StableMod[mod] }}</span>
              <input :disabled="disabled" type="checkbox" :checked="!!((cond.val as number) & mod)" class="checkbox" @change="(cond.val = (cond.val as number) ^ mod)">
            </label>
          </div>
        </div>
      </template>
      <template v-else-if="cond.type === OP.AND || cond.type === OP.OR || cond.type === OP.NOT || cond.type === OP.Remark">
        <div class="col-span-5 md:col-span-8" />
        <div v-if="listMode" class="flex justify-end col-span-1">
          <button :disabled="disabled" class="self-end btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
            <icon name="material-symbols:delete" />
          </button>
        </div>
        <div v-else class="flex justify-end col-span-1">
          <button :disabled="disabled" class="self-end btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
            <icon name="lsicon:clear-filled" />
          </button>
        </div>
        <div class="grid grid-cols-12 col-span-12 gap-2">
          <app-dan-cond
            v-if="cond.type === OP.Remark || cond.type === OP.NOT"
            v-model.lazy="cond.cond"
            :requirements
            :current
            @delete="cond = undefined"
          />
          <draggable
            v-else-if="cond.type === OP.AND || cond.type === OP.OR" v-model.lazy="cond.cond as unknown[]"
            class="grid grid-cols-12 col-span-12 space-y-2"
            v-bind="{
              animation: 200,
              group: 'description',
              disabled: false,
              ghostClass: 'ghost',
            }"
            :item-key="(i?: WrappedCond<OP, Cond>) => i?.cond || 'n'"
            @start="drag = true"
            @end="drag = false"
          >
            <template #item="{ index }">
              <app-dan-cond
                v-model.lazy="cond.cond[index]"
                :list-mode="true"
                :requirements
                :current
                @delete="(cond.cond as Cond[]).splice(index, 1)"
              />
            </template>
            <template #footer>
              <button class="col-span-12 btn btn-sm btn-success btn-outline" @click="(cond.cond as any).push(undefined)">
                {{ t('add') }}
                <icon name="material-symbols:add-rounded" />
              </button>
            </template>
          </draggable>
        </div>
      </template>
      <template v-else-if="cond.type === OP.AccGte || cond.type === OP.ScoreGte || cond.type === OP.BanchoBeatmapIdEq || cond.type === OP.BeatmapMd5Eq">
        <input
          v-model.lazy="cond.val"
          class="input input-sm"
          :disabled="disabled"
          :class="cond.type === OP.AccGte || cond.type === OP.ScoreGte ? 'col-span-6 md:col-span-3' : 'col-span-11 md:col-span-8'"
          :type="cond.type === OP.AccGte || cond.type === OP.ScoreGte ? 'number' : 'text'"
        >
        <div
          class="hidden"
          :class="{
            'md:block md:col-span-4': cond.type === OP.AccGte || cond.type === OP.ScoreGte,
          }"
        />
        <div v-if="listMode" class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
            <icon name="material-symbols:delete" />
          </button>
        </div>
        <div v-else class="flex justify-end col-span-1">
          <button :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
            <icon name="lsicon:clear-filled" />
          </button>
        </div>
      </template>
      <template v-else>
        {{ assertNotReachable(cond) }}
      </template>
    </template>
    <template v-else>
      <div class="col-span-6 md:col-span-3">
        <div class="form-control">
          <select
            value=""
            :disabled="disabled"
            name="cond"
            class="select select-sm"
            @change="v => initCond((v.target as any).value)"
          >
            <option disabled value="">
              {{ t('select') }}
            </option>
            <option v-for="op in ops" :key="op" :value="op">
              {{ t(`dan.cond.${op}`) }}
            </option>
          </select>
        </div>
      </div>
      <div class="col-span-5 md:col-span-8" />
      <div v-if="listMode" class="flex justify-end col-span-1">
        <button :disabled="disabled" class="col-span-2 btn btn-sm btn-circle btn-error btn-outline" @click="emit('delete')">
          <icon name="material-symbols:delete" />
        </button>
      </div>
      <div v-else class="flex justify-end col-span-1">
        <button :disabled="disabled" class="btn btn-sm btn-circle btn-neutral btn-outline" @click="resetCond()">
          <icon name="lsicon:clear-filled" />
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="postcss">
.ghost {
  @apply blur opacity-35;
}
</style>
