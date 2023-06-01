<script lang="ts" setup>
const props = defineProps<{
  name: string
  fallback: string | null
  command: (v: string | null) => void
}>()

const { variables: template } = useEditorTemplates()

const input = ref<HTMLInputElement>()

const model = ref(props.fallback)

const label = computed(() => {
  if (template.has(props.name)) {
    return props.name
  }
})
function send() {
  props.command(model.value)
}
defineExpose({
  input,
})
</script>

<template>
  <form action="#" @submit.prevent="send">
    <div class="card bg-gbase-100/80 backdrop-blur shadow-md p-3">
      <label>Edit the fallback value in case we don't find the Variable &lt;{{ label }}&gt;:</label>
      <input ref="input" v-model="model" class="input input-sm input-primary" type="text" placeholder="there">
      <input type="submit" value="Save">
    </div>
  </form>
</template>
