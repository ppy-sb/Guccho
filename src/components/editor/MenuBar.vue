<script lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3'
// @ts-expect-error it's an url
import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import type { PropType } from 'vue'
import MenuItem from './MenuItem.vue'
export default {
  components: {
    MenuItem,
    BubbleMenu,
  },

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
      link: '',
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
      ],
    }
  },

  methods: {
    setLink() {
      const url = this.link
      console.log(url)
      // empty
      if (!url) {
        this.editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .unsetLink()
          .run()

        return
      }

      // update link
      this.editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run()

      this.link = ''
    },
    prevLink() {
      const link = this.editor.getAttributes('link')
      this.link = link.href
    },
  },
}
</script>

<template>
  <div class="menubar">
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
        <button @click="prevLink">
          <svg class="remix" style="width: 1.2rem; height: 1.2rem">
            <use :xlink:href="`${remixiconUrl}#ri-link`" fill="white" />
          </svg>
        </button>
        <template #popper>
          <div class="card bg-kimberly-100/30">
            <div class="card-body p-2">
              <div class="input-group input-group-sm">
                <span>URL</span>
                <input id="url" v-model="link" type="url" class="input input-sm shadow-lg">
                <button class="btn btn-sm btn-success" @click="setLink">
                  apply
                </button>
              </div>
            </div>
          </div>
        </template>
      </v-dropdown>
      <!-- <button v-else :disabled="!editor.isActive('link')" @click="editor.chain().focus().unsetLink().run()">
        unsetLink
      </button> -->
    </BubbleMenu>
    <template v-for="(item, index) in items">
      <div
        v-if="item.type === 'divider'"
        :key="`divider${index}`"
        class="divider"
      />
      <MenuItem v-else :key="index" v-bind="item" class="menu-item icon" />
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
      width: 100%;
      height: 100%;
      fill: currentColor;
    }

    &.icon {
      padding: 0.25rem;
    }

    &.is-active,
    &:hover {
      @apply text-kimberly-100 bg-kimberly-800 dark:text-kimberly-900 dark:bg-kimberly-100;
      // color:#FFF;
      // background-color:#0D0D0D;
    }
  }

  .icon {
    width: 1.75rem !important;
    height: 1.75rem !important;
  }
}
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
