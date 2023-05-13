<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { TResponsiveModal } from '#components'

const props = defineProps<{
  editor: Editor
}>()

const img = shallowReactive<{
  src?: string
  alt?: string
  title?: string
}>({})

function reset() {
  img.alt = undefined
  img.src = undefined
  img.title = undefined
}

function setLink(cb: CallableFunction) {
  if (!img.src) {
    return
  }
  props.editor.commands.setImage({
    src: img.src,
    alt: img.alt,
    title: img.title,
  })
  cb()
}
const modal = ref<InstanceType<typeof TResponsiveModal>>()
defineExpose({
  show: () => modal.value?.showModal(),
})
</script>

<template>
  <t-responsive-modal ref="modal" v-slot="{ closeModal }" class="my-auto max-w-full" @closed="reset">
    <div class="card bg-base-100/50 shadow-lg w-full">
      <form action="#" @submit.prevent="setLink(closeModal)">
        <div class="card-body w-96">
          <div class="form-control">
            <label class="label" for="src">
              <span class="pl-2 label-text">URL</span>
            </label>
            <input
              id="src"
              v-model="img.src"
              type="url"
              class="input input-sm input-ghost"
              required
            >
          </div>
          <div class="form-control">
            <label class="label" for="title">
              <span class="pl-2 label-text">Title</span>
            </label>
            <input
              id="title"
              v-model="img.title"
              type="text"
              class="input input-sm input-ghost"
            >
          </div>
          <div class="form-control">
            <label class="label" for="description">
              <span class="pl-2 label-text">Description</span>
            </label>
            <textarea
              id="description"
              v-model="img.alt"
              class="input input-sm input-ghost"
            />
          </div>
        </div>
        <div class="flex p-4 gap-2">
          <t-button size="sm" variant="accent" class="grow">
            confirm
          </t-button>
          <t-button
            size="sm"
            variant="secondary"
            class="grow"
            type="button"
            @click="closeModal"
          >
            cancel
          </t-button>
        </div>
      </form>
    </div>
  </t-responsive-modal>
</template>

<style scoped>

</style>
