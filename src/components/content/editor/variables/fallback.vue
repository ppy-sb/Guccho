<script lang="ts" setup>
const props = defineProps<{
  name: string
  fallback: string | null
  t: boolean
  command: (v: string | null) => void
}>()

const input = ref<HTMLInputElement>()
const { t } = useI18n()

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
    <div class="card bg-base-100/80 backdrop-blur shadow-md p-3 gap-2">
      <label>Fallback content for <b>{{ props.t ? t($props.name) : $props.name }}</b>:</label>
      <input ref="input" v-model="model" class="input input-shadow input-sm input-primary" type="text">
      <input type="submit" value="Save" class="btn btn-shadow btn-primary btn-sm">
    </div>
  </form>
</template>
