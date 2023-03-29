<script setup lang="ts">
import useReloadAnimation from './composables/animation/useReloadAnimation'
import RollerItem from './item.vue'
import type { RollerItemCharSet, RollerItemMode } from './main'
import { RollerCharSet } from './main'
import './index.style.scss?style'

export interface Props {
  value?: string
  defaultValue?: string
  duration?: number
  charSet?: string[] | RollerItemCharSet | string
  mode?: RollerItemMode | string
}

const props = withDefaults(defineProps<Props>(), {
  value: '123',
  defaultValue: '',
  duration: 500,
})
const emit = defineEmits<{
  (e: 'animation-end'): void
}>()
const { duration, value } = toRefs(props)

// animation
const { reloadAnimation, onAnimationEnd } = useReloadAnimation(duration)
watch([value], () => {
  reloadAnimation()
})
// eslint-disable-next-line vue/custom-event-name-casing
onAnimationEnd(() => emit('animation-end'))

reloadAnimation()

// char & char-set
const charArray = computed(() => [...props.value])
const defaultCharArray = computed(() => [...props.defaultValue])
const computedCharSet = computed(() => {
  if (Array.isArray(props.charSet)) {
    return props.charSet as string[]
  }
  return RollerCharSet[props.charSet as RollerItemCharSet]
})
const client = ref(false)
onBeforeMount(() => {
  client.value = true
})
</script>

<template>
  <TransitionGroup
    tag="div"
    name="roller-list"
    class="roller"
    v-bind="$attrs"
  >
    <RollerItem
      v-for="(char, idx) of charArray"
      :key="idx"
      :char="char"
      :duration="duration"
      :char-set="computedCharSet"
      :default-char="defaultCharArray[idx]"
      :mode="mode"
    />
  </TransitionGroup>
</template>
