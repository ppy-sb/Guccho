import type { Id } from '../config'
export function stringToId(input: string): Id {
  return parseInt(input)
}
export function idToString(input: Id): string {
  return input.toString()
}
