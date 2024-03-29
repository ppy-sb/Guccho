import type { Id, ScoreId } from '..'

export function stringToId(input: string): Id {
  return Number.parseInt(input)
}
export function stringToScoreId(input: string): ScoreId {
  return BigInt(input)
}

export function scoreIdToString(input: ScoreId): string {
  return input.toString()
}

export function idToString(input: Id): string {
  return input.toString()
}
