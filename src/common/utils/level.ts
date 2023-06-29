const ONE_HUNDRED_BILLION = BigInt(100_000_000_000)
const MAX_ALLOWED_SCORE = BigInt('10000000000000000')

const requiredScoreCache: { [level: number]: bigint } = {}

export function getRequiredScoreForLevel(level: number): bigint {
  if (requiredScoreCache[level]) {
    return requiredScoreCache[level]
  }

  let score: bigint
  if (level <= 100) {
    if (level > 1) {
      score = BigInt(
        Math.floor(
          (5000 / 3) * (4 * level ** 3 - 3 * level ** 2 - level)
            + Math.floor(1.25 * 1.8 ** (level - 60))
        )
      )
    }
    else {
      score = BigInt(1)
    }
  }
  else {
    score
      = BigInt('26931190829')
      + ONE_HUNDRED_BILLION * BigInt(level)
      - BigInt(100)
  }

  requiredScoreCache[level] = score
  return score
}

export function getLevel(score: bigint): number {
  let left = 1
  let right = 1_000_000

  while (left < right) {
    const mid = Math.ceil((left + right) / 2)
    const requiredScore = getRequiredScoreForLevel(mid)

    if (score >= requiredScore) {
      left = mid
    }
    else {
      right = mid - 1
    }
  }

  return left - 1
}

export function getLevelWithProgress(score: bigint): number {
  if (score > MAX_ALLOWED_SCORE) {
    return 0
  }

  const baseLevel = getLevel(score)
  const baseLevelScore = getRequiredScoreForLevel(baseLevel)
  const scoreProgress = score - baseLevelScore
  const scoreLevelDifference
    = getRequiredScoreForLevel(baseLevel + 1) - baseLevelScore
  let res = Number(scoreProgress) / Number(scoreLevelDifference)
  if (Number.isNaN(res) || !Number.isFinite(res)) {
    res = 0
  }
  return res + baseLevel
}
