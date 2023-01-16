<script setup lang="ts">
import { computed, toRefs, watch } from 'vue'
import useReloadAnimation from './composables/animation/useReloadAnimation'
import RollerItem from './item.vue'
import type { RollerItemCharSet, RollerItemMode } from './main'
import { RollerCharSet } from './main'

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
  if (Array.isArray(props.charSet))
    return props.charSet as string[]
  return RollerCharSet[props.charSet as RollerItemCharSet]
})
const client = ref(false)
onBeforeMount(() => {
  client.value = true
})
</script>

<template>
  <client-only>
    <TransitionGroup tag="div" name="roller-list" class="roller" v-bind="$attrs">
      <RollerItem v-for="(char, idx) of charArray" :key="idx" :char="char" :duration="duration" :char-set="computedCharSet" :default-char="defaultCharArray[idx]" :mode="mode" />
    </TransitionGroup>
  </client-only>
  <div v-if="!client" v-bind="$attrs" class="invisible">
    {{ value }}
  </div>
</template>

<style lang="postcss" scoped>
.roller {
    display: flex;
    /* flex-wrap: wrap; */
}
.roller-list-enter-active,
.roller-list-leave-active {
    transition: 0.5s;
}
.roller-list-enter-from {
    opacity: 0;
}
.roller-list-enter-to {
    opacity: 1;
}
.roller-list-leave-from {
    opacity: 1;
}
.roller-list-leave-to {
    opacity: 0;
    width: 0px !important;
}
</style>
