import { Highlight } from '@tiptap/extension-highlight'
import { Typography } from '@tiptap/extension-typography'
import { StarterKit } from '@tiptap/starter-kit'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'

import { lowlight } from 'lowlight/lib/core'

export default (config?: {
  indent?: string
}) => [
  StarterKit.configure({
    codeBlock: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight,
  TaskList,
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
          if (!this.editor.isActive('codeBlock'))
            return false
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
