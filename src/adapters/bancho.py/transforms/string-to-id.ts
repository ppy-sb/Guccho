import type { Id } from '../config'
export function stringToId(input: string): Id {
  return parseInt(input)
}
