export function getLevel(score: bigint): number {
  let i = 1
  for (;;) {
    const lScore = getRequiredScoreForLevel(i)
    if (score < lScore) {
      return i - 1
    }

    i++
  }
}

export function getRequiredScoreForLevel(level: number) {
  if (level <= 100) {
    if (level > 1) {
      return BigInt(
        Math.floor(
          (5000 / 3) * (4 * level ** 3 - 3 * level ** 2 - level)
            + Math.floor(1.25 * 1.8 ** (level - 60))
        )
      )
    }

    return BigInt(1)
  }
  return (
    BigInt('26931190829') + BigInt(100000000000) * BigInt(level) - BigInt(100)
  )
}

export function getLevelWithProgress(score: bigint) {
  if (score > BigInt('10000000000000000')) {
    return 0
  }

  const baseLevel = getLevel(score)
  const baseLevelScore = getRequiredScoreForLevel(baseLevel)
  const scoreProgress = score - baseLevelScore
  const scoreLevelDifference
    = getRequiredScoreForLevel(baseLevel + 1) - baseLevelScore
  let res = Number(scoreProgress) / Number(scoreLevelDifference)
  if (res === -Infinity) {
    res = 0
  }
  return res + baseLevel
}
