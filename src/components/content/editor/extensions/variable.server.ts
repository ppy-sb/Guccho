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
            return element.getAttribute('data-key')
          },
          renderHTML: (attributes) => {
            if (!attributes.name) {
              return {}
            }

            return {
              'data-key': attributes.name,
            }
          },
        },
        fallback: {
          default: null,
          parseHTML: (element) => {
            return element.getAttribute('fallback')
          },
          renderHTML: (attributes) => {
            if (!attributes.fallback) {
              return {}
            }

            return {
              fallback: attributes.fallback,
            }
          },
        },
      }
    },

    parseHTML() {
    // @ts-expect-error L80
      return [{ tag: `span.custom-variable[data-key="${this.name}"][fallback="${this.fallback}"]` }]
    },

    renderHTML({ node, HTMLAttributes }) {
      const attributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
      const _entry = variables.get(`${node.attrs.name}`)

      if (!_entry) {
        attributes['missing-key'] = ''
      }
      attributes.fallback ||= _entry?.fallback

      return ['span', attributes, _entry?.value || attributes.fallback || attributes.name]
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
