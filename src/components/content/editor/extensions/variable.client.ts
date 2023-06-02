import { InputRule, Node, PasteRule, mergeAttributes } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { Plugin, PluginKey } from 'prosemirror-state'

import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import 'tippy.js/animations/scale-subtle.css'
import { nextTick } from 'vue'

import ctx, { starInputRegex, starPasteRegex } from './variable.shared'
import { ContentEditorVariablesFallback, ContentEditorVariablesOptions } from '#components'

export default function () {
  const { handleRule, variables } = ctx()
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
      const _entry = variables.get(node.attrs.name)

      if (!_entry) {
        attributes['missing-key'] = ''
        return ['span', attributes, `${node.attrs.name}`]
      }

      if (this.editor?.isEditable) {
        attributes['data-tip'] = `${_entry.value}${attributes.fallback ? ` |  ${attributes.fallback}` : ''} | ${_entry.fallback}`
        return ['span', attributes, `${node.attrs.name}`]
      }

      return ['span', attributes, _entry?.value || node.attrs.fallback || _entry?.fallback || node.attrs.name]
    },

    renderText({ node }) {
      if (this.editor?.isEditable) {
        return `${node.attrs.name}`
      }
      const _entry = variables.get(node.attrs.name)

      return `{{ ${_entry?.value || node.attrs.fallback || _entry?.fallback || node.attrs.name} }}`
    },

    addKeyboardShortcuts() {
      return {
      // TODO : To review this one !
        Backspace: () => this.editor.commands.command(({ tr, state }) => {
          let isVariable = false
          const { selection } = state
          const { empty, anchor } = selection

          if (!empty) {
            return false
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isVariable = true
              tr.insertText(`{{ ${node.attrs.name}`, pos, pos + node.nodeSize)

              return false
            }
          })

          return isVariable
        }),
      }
    },

    addInputRules() {
      return [
        new InputRule({
          find: starInputRegex,
          handler: (state) => {
            handleRule.call(this, state)
          },
        }),
      ]
    },

    addPasteRules() {
      return [
        new PasteRule({
          find: starPasteRegex,
          handler: (state) => {
            handleRule.call(this, state)
          },
        }),
      ]
    },

    addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
      const currentNode = this

      return [
        Suggestion<{ var: string; fallback: string }>({
          editor: this.editor,
          pluginKey: new PluginKey('variable'),
          char: '{{',
          allowSpaces: true,
          command: ({ editor, range, props }) => {
          // increase range.to by one when the next node is of type "text"
          // and starts with a space character
            const nodeAfter = editor.view.state.selection.$to.nodeAfter
            const overrideSpace = nodeAfter?.text?.startsWith(' ')

            if (overrideSpace) {
              range.to += 1
            }

            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: this.name,
                  attrs: props,
                },
              ])
              .run()
          },
          render() {
            let component: VueRenderer
            let popup: ReturnType<typeof tippy>[number]

            return {
              onStart: (props) => {
                component = new VueRenderer(ContentEditorVariablesOptions, {
                  props,
                  editor: props.editor,
                })

                popup = tippy(document.body, {
                  getReferenceClientRect: props.clientRect as any,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: props.editor.isFocused,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'auto',
                  animation: 'scale-subtle',
                }) as unknown as typeof popup
              },
              onUpdate(props) {
                if (!props.editor.isFocused) {
                  return
                }

                component.updateProps(props)
                nextTick(() => {
                  if (component.ref?.availableOptions.length > 0) {
                    popup.setProps({ getReferenceClientRect: props.clientRect as any })
                    if (!popup.state.isVisible) {
                      popup.show()
                    }
                  }
                  else {
                    popup.hide()
                  }
                })
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  this.onExit?.(undefined as any)
                  return true
                }

                if (popup.state.isVisible) {
                  return component.ref?.onKeyDown(props)
                }
              },
              onExit() {
                if (!popup.state.isDestroyed) {
                  popup.destroy()
                }
                component.destroy()
              },
            }
          },
        }),
        new Plugin({
          props: {
            handleClickOn: (view, pos, node, nodePos, event, _direct) => {
              if (node.type !== currentNode.type) {
                return false
              }

              let popup: ReturnType<typeof tippy>[number]
              const component = new VueRenderer(ContentEditorVariablesFallback, {
                editor: this.editor,
                props: {
                  command: (fallback: CallableFunction) => {
                    const transaction = view.state.tr.setNodeMarkup(
                      nodePos, undefined, { name: node.attrs.name, fallback }
                    )
                    view.dispatch(transaction)
                    popup.destroy()
                  },
                  ...node.attrs,
                },
              })

              popup = tippy(event.target as HTMLElement, {
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                animation: 'scale-subtle',
                onDestroy() {
                  component.destroy()
                },
                onMount(instance) {
                  component.ref.input.focus()
                  instance.popper.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                      instance.destroy()
                    }
                  })
                },
              })
            },
          },
        }),
      ]
    },
  })
  return Variable
}
