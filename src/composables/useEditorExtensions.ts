/* eslint-disable import/no-named-as-default */
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
// import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

import { lowlight } from 'lowlight/lib/core'

export default () => [
  StarterKit.configure({
    codeBlock: false
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  Highlight,
  TaskList,
  TaskItem,
  Typography,
  CharacterCount.configure({
    limit: 10000
  }),
  CodeBlockLowlight.configure({
    lowlight,
    exitOnArrowDown: true
  })
]
