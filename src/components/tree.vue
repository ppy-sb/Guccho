<script setup lang="ts">
import type { TSingleSelect } from '#components'

interface Prop {
  path: string
  name: string
  children?: Prop[]
}
const props = defineProps<Prop>()

const emit = defineEmits<(event: 'select', data: Prop) => void>()

const stack = ref<Prop[]>([props])
const t = ref<InstanceType<typeof TSingleSelect>>()
function levelUp(lv: number) {
  if (!lv) {
    lv = 1
  }
  stack.value.splice(lv)
}

const selected = computed(() => stack.value.at(-1) || props)

const children = computed(() => selected.value.children?.sort(a => a.children ? -1 : 1).map(child => ({ value: child, label: ((child.children ? '> ' : '- ') + child.name) as string | number })) || [])
type Child = typeof children['value'][number]
const selectedChildren = ref<Child>()
function select({ value: child }: Child) {
  if (child.children) {
    stack.value.push(child)
    return
  }
  emit('select', child)
}
</script>

<template>
  <div class="flex gap-2">
    <div class="text-sm breadcrumbs">
      <ul>
        <li v-for="(p, level) in stack" :key="`p-${p}`">
          <a @click.prevent="levelUp(level)">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 mr-2 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            {{ p.name }}
          </a>
        </li>
        <li />
      </ul>
    </div>
    <t-single-select v-if="selected.children" ref="t" v-model="selectedChildren" class="font-mono" size="sm" :options="children" @update:model-value="(value) => select(value)" />
  </div>
</template>

<style scoped>

</style>
