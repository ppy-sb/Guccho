import useEditorExtensionsBase from './useEditorExtensionsBase'
import _Variable from '~/components/content/editor/extensions/variable.server'

export default <TEdit extends boolean>(config?: { indent?: string; edit?: TEdit }) => {
  const Variable = _Variable()
  return [
    ...useEditorExtensionsBase(config),
    Variable,
  ]
}
