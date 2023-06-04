<script setup  lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3'

import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'

const props = defineProps<{
  editor: Editor
}>()
const link = shallowRef('')

function prevLink() {
  const _link = props.editor.getAttributes('link')
  link.value = _link.href
}

function setLink() {
  const url = link.value
  // empty
  if (!url) {
    props.editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run()

    return
  }

  // update link
  props.editor
    .chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url })
    .run()

  link.value = ''
}
</script>

<template>
  <BubbleMenu
    class="bubble-menu"
    :tippy-options="{ duration: 100 }"
    :editor="editor"
  >
    <v-dropdown
      theme="guweb-dropdown"
      :distance="10"
      strategy="absolute"
    >
      <button class="h-full" @click="prevLink">
        <svg class="remix w-5 h-5">
          <use :xlink:href="`${remixiconUrl}#ri-link`" fill="white" />
        </svg>
      </button>
      <template #popper="{ hide }">
        <div class="card bg-gbase-100/70">
          <div class="card-body p-2">
            <div class="input-group input-group-sm">
              <span>URL</span>
              <input id="url" v-model="link" type="url" class="input input-sm shadow-sm">
              <button
                class="btn btn-sm btn-success" @click="() => {
                  setLink()
                  hide()
                }"
              >
                apply
              </button>
            </div>
          </div>
        </div>
      </template>
    </v-dropdown>
  </BubbleMenu>
</template>

<style lang="postcss">
.bubble-menu {
  display: flex;
  background-color: #0d0d0d;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}
</style>
