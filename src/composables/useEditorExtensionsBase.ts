import { Highlight } from '@tiptap/extension-highlight'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Typography } from '@tiptap/extension-typography'
import { Image } from '@tiptap/extension-image'

export default <TEdit extends boolean>(_?: { indent?: string; edit?: TEdit }) => [
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
  Image.configure({
    allowBase64: true,
  }),
]
