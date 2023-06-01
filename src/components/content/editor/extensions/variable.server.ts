import { Node, mergeAttributes } from '@tiptap/core'

import ctx from './variable.shared'

export default function () {
  const { variables } = ctx()
  const Variable = Node.create({
    name: 'variable',
    draggable: false,
    group: 'inline',
    inline: true,
    selectable: false,
    atom: true,

    addOptions() {
      return {
        ...this.parent?.(),
        inline: true,
        draggable: false,
        HTMLAttributes: {
          class: 'custom-variable',
        },
      }
    },

    addAttributes() {
      return {
        name: {
          default: null,
          parseHTML: (element) => {
            return element.getAttribute('data-name')
          },
          renderHTML: (attributes) => {
            if (!attributes.name) {
              return {}
            }

            return {
              'data-name': attributes.name,
            }
          },
        },
        fallback: {
          default: null,
          parseHTML: (element) => {
            return element.getAttribute('data-fallback')
          },
          renderHTML: (attributes) => {
            if (!attributes.fallback) {
              return {}
            }

            return {
              'data-fallback': attributes.fallback,
            }
          },
        },
      }
    },

    parseHTML() {
    // @ts-expect-error L80
      return [{ tag: `span.custom-variable[data-name="${this.name}"][data-fallback="${this.fallback}"]` }]
    },

    renderHTML({ node, HTMLAttributes }) {
      const attributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
      if (!node.attrs.fallback) {
        attributes.class += ' variable--missing-fallback'
      }
      const _entry = variables.get(`${node.attrs.name}`)

      if (this.editor?.isEditable) {
        return ['span', attributes, `${node.attrs.name}`]
      }

      return ['span', attributes, _entry?.value || _entry?.defaultFallback || node.attrs.name]
    },

    renderText({ node }) {
      if (node.attrs.fallback) {
        return `{{ ${node.attrs.name}|"${node.attrs.fallback}" }}`
      }

      return `{{ ${node.attrs.name} }}`
    },

  })
  return Variable
}
