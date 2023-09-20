import type { Editor, InputRule, PasteRule } from '@tiptap/core'
import type { NodeType } from 'prosemirror-model'

import useEditorVariables from '~/composables/useEditorVariables'

export const starInputRegex = /(?:^|\s)((?:{{ ?)((?:[^}}]+))(?: ?}}))$/
export const starPasteRegex = /(?:^|\s)((?:{{ ?)((?:[^}}]+))(?: ?}}))/g

export default function () {
  const { variables } = useEditorVariables()

  function handleRule(this: {
    name: string
    options: any
    storage: any
    editor: Editor
    type: NodeType
    parent: (() => PasteRule[] | InputRule[]) | undefined
  }, { state, range, match }: any) {
    const keyword = match[2].trim()
    let [name, fallback] = keyword.split('|', 2)
    name = name.toLocaleLowerCase()

    if (!variables.has(name)) {
      return false
    }

    if (fallback && fallback.substring(0, 1) === '"' && fallback.substring(0, 1) === fallback.substring(fallback.length - 1)) {
      fallback = fallback.substr(1, fallback.length - 1)
    }

    let addedPosition = 0
    if (match[0].substring(0, 1) === ' ') {
      addedPosition = 1
    }

    state.tr.replaceWith(
      range.from + addedPosition,
      range.to,

      this.type.create({ name, fallback }),
    )
  }
  return {
    handleRule,
    variables,
  }
}
