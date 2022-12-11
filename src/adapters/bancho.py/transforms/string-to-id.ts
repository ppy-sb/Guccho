import type { IdType } from '../config'
export function stringToId(input: string): IdType {
  return parseInt(input)
}
