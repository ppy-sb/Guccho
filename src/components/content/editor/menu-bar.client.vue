<script lang="ts">
import type { Editor } from '@tiptap/vue-3'

// @ts-expect-error it's an url
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import type { PropType } from 'vue'
import { type ContentEditorInsertImage } from '#components'

export default defineComponent({

  props: {
    editor: {
      type: Object as PropType<Editor>,
      required: true,
    },
    indent: {
      type: String,
      default: '  ',
    },
  },
  emits: ['update:indent'],

  data() {
    return {
      remixiconUrl,
      items: [
        {
          icon: 'bold',
          title: 'Bold',
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive('bold'),
        },
        {
          icon: 'italic',
          title: 'Italic',
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive('italic'),
        },
        {
          icon: 'strikethrough',
          title: 'Strike',
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive('strike'),
        },
        ...['left', 'center', 'right', 'justify'].map(align => ({
          icon: `align-${align}`,
          title: `Align ${align}`,
          action: () => this.editor.chain().focus().setTextAlign(align).run(),
          isActive: () => this.editor.isActive({ textAlign: align }),
        })),
        {
          icon: 'code-view',
          title: 'Code',
          action: () => this.editor.chain().focus().toggleCode().run(),
          isActive: () => this.editor.isActive('code'),
        },
        {
          icon: 'mark-pen-line',
          title: 'Highlight',
          action: () => this.editor.chain().focus().toggleHighlight().run(),
          isActive: () => this.editor.isActive('highlight'),
        },
        {
          type: 'divider',
        },
        ...([1, 2, 3, 4, 5, 6] as const).map(h => ({
          icon: `h-${h}`,
          title: `Heading ${h}`,
          action: () =>
            this.editor.chain().focus().toggleHeading({ level: h }).run(),
          isActive: () => this.editor.isActive('heading', { level: h }),
        })),
        {
          icon: 'paragraph',
          title: 'Paragraph',
          action: () => this.editor.chain().focus().setParagraph().run(),
          isActive: () => this.editor.isActive('paragraph'),
        },
        {
          icon: 'list-unordered',
          title: 'Bullet List',
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive('bulletList'),
        },
        {
          icon: 'list-ordered',
          title: 'Ordered List',
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive('orderedList'),
        },
        {
          icon: 'list-check-2',
          title: 'Task List',
          action: () => this.editor.chain().focus().toggleTaskList().run(),
          isActive: () => this.editor.isActive('taskList'),
        },
        {
          icon: 'code-box-line',
          title: 'Code Block',
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive('codeBlock'),
        },
        {
          type: 'divider',
        },
        {
          icon: 'double-quotes-l',
          title: 'Blockquote',
          action: () => this.editor.chain().focus().toggleBlockquote().run(),
          isActive: () => this.editor.isActive('blockquote'),
        },
        {
          icon: 'separator',
          title: 'Horizontal Rule',
          action: () => this.editor.chain().focus().setHorizontalRule().run(),
        },
        {
          type: 'divider',
        },
        {
          icon: 'image-add-line',
          title: 'Insert Image',
          action: () => (this.$refs.insertImage as InstanceType<typeof ContentEditorInsertImage>)?.show(),
        },
        {
          type: 'divider',
        },
        {
          icon: 'text-wrap',
          title: 'Hard Break',
          action: () => this.editor.chain().focus().setHardBreak().run(),
        },
        {
          icon: 'format-clear',
          title: 'Clear Format',
          action: () =>
            this.editor.chain().focus().clearNodes().unsetAllMarks().run(),
        },
        {
          type: 'divider',
        },
        {
          icon: 'arrow-go-back-line',
          title: 'Undo',
          action: () => this.editor.chain().focus().undo().run(),
        },
        {
          icon: 'arrow-go-forward-line',
          title: 'Redo',
          action: () => this.editor.chain().focus().redo().run(),
        },
        {
          type: 'divider',
        },
      ] as const,
    }
  },

})
</script>

<template>
  <div class="menubar">
    <content-editor-insert-image ref="insertImage" :editor="editor" />
    <template v-for="(item, index) in items">
      <div
        v-if="'type' in item && item.type === 'divider'"
        :key="`divider${index}`"
        class="divider"
      />
      <content-editor-menu-item v-else :key="index" v-bind="item" class="menu-item icon" />
    </template>
    <template v-if="editor.isActive('codeBlock')">
      <label for="indent" class="label">Indent:</label>
      <button
        class="flex items-center menu-item"
        :class="{
          'is-active': indent === '  ',
        }"
        @click="$emit('update:indent', '  ')"
      >
        <svg class="remix" style="width: 1.5rem; height: 1.5rem">
          <use :xlink:href="`${remixiconUrl}#ri-space`" />
        </svg>
        2
      </button>
      <button
        class="flex menu-item"
        :class="{
          'is-active': indent === '    ',
        }"
        @click="$emit('update:indent', '    ')"
      >
        <svg class="remix" style="width: 1.5rem; height: 1.5rem">
          <use :xlink:href="`${remixiconUrl}#ri-space`" />
        </svg>
        4
      </button>
      <button
        class="menu-item"
        :class="{
          'is-active': indent === '\t',
        }"
        @click="$emit('update:indent', '\t')"
      >
        ⇥
      </button>
    </template>
  </div>
</template>

<style lang="scss">
.menubar {
  .divider {
    width: 2px;
    height: 1.25rem;
    background-color: rgba(#000, 0.1);
    margin-left: 0.5rem;
    margin-right: 0.75rem;
  }

  .menu-item {
    border: none;
    background-color: transparent;
    border-radius: 0.4rem;
    margin-right: 0.25rem;
    padding: 0.25rem;

    svg {
      @apply text-gbase-900 dark:text-gbase-100;
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    &.icon {
      padding: 0.25rem;
    }

    &.is-active,
    &:hover {
      @apply text-gbase-100 bg-gbase-800 dark:text-gbase-900 dark:bg-gbase-100;
      // color:#FFF;
      // background-color:#0D0D0D;
      svg {
        @apply text-gbase-100 dark:text-gbase-900;
      }
    }
  }

  .icon {
    width: 1.75rem !important;
    height: 1.75rem !important;
  }
}
</style>
