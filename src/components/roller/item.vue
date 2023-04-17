<script setup lang="ts">
import useAnimationManager from './composables/animation/useAnimationManager'
import useMeasureText from './composables/useMeasureText'
import useSelectElement from './composables/useSelectElement'
import { RollerCharSet, RollerItemCharSet, RollerItemMode } from './main'

export interface Props {
  char?: string
  defaultChar?: string
  duration?: number
  charSet?: string[]
  mode?: RollerItemMode | string
}
const props = withDefaults(defineProps<Props>(), {
  char: '',
  defaultChar: '',
  charSet: () => RollerCharSet[RollerItemCharSet.NUMBER],
  duration: 500,
  mode: RollerItemMode.SHORT,
})

const { char, defaultChar, charSet, duration } = toRefs(props)

const { isReady, isEnd, targetIdx, prevTargetIdx } = useAnimationManager(
  char,
  defaultChar,
  charSet,
  duration,
)

const itemElements = shallowRef<HTMLDivElement[]>([])
const { itemElement } = useSelectElement(itemElements, targetIdx)
const { width } = useMeasureText(itemElement)

/**
 * @description Now the top value of the roller
 */
const top = computed(() => {
  if (!isReady.value) {
    if (prevTargetIdx.value !== -1) {
      return `-${(prevTargetIdx.value / charSet.value.length) * 100}%`
    }
    return '0%'
  }
  if (targetIdx.value === -1) {
    return `-${(1 / charSet.value.length) * 100}%`
  }
  return `-${(targetIdx.value / charSet.value.length) * 100}%`
})

/**
 * @description Array of characters to be displayed after animation ends
 */
const shortCharSet = computed(() => {
  // In case of short mode, it is sufficient to show only one char
  if (props.mode === RollerItemMode.SHORT) {
    return [props.char]
  }

  // For values not in charSet, an empty string is inserted before and after.
  if (targetIdx.value === -1) {
    return ['', props.char, '']
  }

  // at the beginning of the array
  if (targetIdx.value === 0) {
    return ['', props.char, props.charSet[targetIdx.value + 1]]
  }

  // at the end of the array
  if (targetIdx.value === charSet.value.length - 1) {
    return [props.charSet[targetIdx.value - 1], props.char, '']
  }

  // in all other cases
  return props.charSet.slice(targetIdx.value - 1, targetIdx.value + 2)
})
</script>

<template>
  <div class="roller-item" :style="{ width: `${width}px` }">
    <div
      v-if="isEnd"
      class="roller-item__wrapper"
      :class="{ 'roller-item__wrapper--short': mode === RollerItemMode.SHORT }"
    >
      <div class="roller-item__wrapper__list">
        <div
          v-for="item of shortCharSet"
          ref="itemElements"
          :key="item"
          class="roller-item__wrapper__list__item"
          :class="{ 'roller-item__wrapper__list__item--target': item === char }"
        >
          {{ item }}
        </div>
      </div>
    </div>
    <div
      v-else
      class="roller-item__wrapper"
      :class="{ 'roller-item__wrapper--short': mode === RollerItemMode.SHORT }"
    >
      <div
        class="roller-item__wrapper__list top-[25%]"
        :style="{
          transform: `translateY(${top})`,
          transition: `transform ${duration}ms`,
        }"
      >
        <div
          v-for="item of charSet"
          ref="itemElements"
          :key="item"
          class="roller-item__wrapper__list__item"
          :class="{ 'roller-item__wrapper__list__item--target': item === char }"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.roller-item {
  position: relative;

  height: 1em;

  transition: width 500ms;

  .roller-item__wrapper {
    position: relative;

    display: flex;
    align-items: center;

    width: 100%;
    height: 200%;

    overflow: hidden;

    top: -50%;

    mask-image: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 1) 25%,
      rgba(0, 0, 0, 1) 75%,
      rgba(255, 255, 255, 0) 100%
    );
    -webkit-mask-image: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 1) 25%,
      rgba(0, 0, 0, 1) 75%,
      rgba(255, 255, 255, 0) 100%
    );

    box-sizing: border-box;

    &.roller-item__wrapper--short {
      mask-image: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0) 20%,
        rgba(0, 0, 0, 1) 30%,
        rgba(0, 0, 0, 1) 70%,
        rgba(255, 255, 255, 0) 80%
      );
      -webkit-mask-image: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0) 20%,
        rgba(0, 0, 0, 1) 30%,
        rgba(0, 0, 0, 1) 70%,
        rgba(255, 255, 255, 0) 80%
      );
    }
    .roller-item__wrapper__list {
      position: absolute;

      width: 100%;

      display: flex;
      align-items: center;
      flex-direction: column;

      box-sizing: border-box;

      transition: 0.25s;

      .roller-item__wrapper__list__item {
        display: flex;

        width: fit-content;
        height: 1em;

        line-height: 1;

        box-sizing: border-box;

        user-select: none;
      }
      .roller-item__wrapper__list__item--target {
        user-select: text;
      }
    }
  }
}
</style>
