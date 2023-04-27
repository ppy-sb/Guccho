import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { library } from '@fortawesome/fontawesome-svg-core'

export default function useLibrary() {
  return { addToLibrary: (...icon: IconDefinition[]) => library.add(...icon) }
}
