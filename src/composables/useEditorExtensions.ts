import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { StarterKit } from '@tiptap/starter-kit'

import { lowlight } from 'lowlight/lib/core.js'

export default (config?: { indent?: string; link?: { openOnClick: boolean } }) => [
  StarterKit.configure({
    codeBlock: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight,
  TaskList,
  Link.configure({
    autolink: true,
    linkOnPaste: true,
    openOnClick: false,
  }),
  TaskItem,
  Typography,
  // CharacterCount.configure({
  //   limit: 10000
  // }),
  CodeBlockLowlight.extend({
    addKeyboardShortcuts() {
      return {
        ...this.parent?.(),
        Tab: ({ editor }) => {
          if (!this.editor.isActive('codeBlock')) {
            return false
          }
          editor.commands.insertContent(config?.indent || '  ')
          return true
        },
      }
    },
  }).configure({
    lowlight,
    exitOnArrowDown: true,
    HTMLAttributes: {
      class: 'border border-kimberly-500/20',
    },
  }),
]
