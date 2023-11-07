import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { StarterKit } from '@tiptap/starter-kit'
import useEditorExtensionsBase from './useEditorExtensionsBase'
import { lowlight } from './useLazyLoadLowlight'
import _Variable from '~/components/content/editor/extensions/variable.client'

export default <TEdit extends boolean>(config: { indent?: string; edit?: TEdit; i18n: { t: (str: string) => string } }) => {
  const Variable = _Variable(config)
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
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
        class: 'border border-gbase-500/20',
      },
    }),
    ...useEditorExtensionsBase(config),
    Variable,
  ]
}
