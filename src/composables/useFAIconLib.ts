import { IconDefinition, library } from '@fortawesome/fontawesome-svg-core'

export default function useLibrary () {
  return { addToLibrary: (...icon: IconDefinition[]) => library.add(...icon) }
}
