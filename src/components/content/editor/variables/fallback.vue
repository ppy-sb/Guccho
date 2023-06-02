<script lang="ts" setup>
const props = defineProps<{
  name: string
  fallback: string | null
  command: (v: string | null) => void
}>()

const input = ref<HTMLInputElement>()

const model = ref(props.fallback)

function send() {
  props.command(model.value)
}
defineExpose({
  input,
})
</script>

<template>
  <form action="#" @submit.prevent="send">
    <div class="card bg-gbase-100/80 backdrop-blur shadow-md p-3 gap-2">
      <label>Fallback content for <b>{{ $props.name }}</b>:</label>
      <input ref="input" v-model="model" class="input input-sm input-primary" type="text" placeholder="there">
      <input type="submit" value="Save" class="btn btn-primary btn-sm">
    </div>
  </form>
</template>
