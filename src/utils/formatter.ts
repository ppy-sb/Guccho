export function createScoreFormatter(
  opt: Intl.NumberFormatOptions = {
    notation: 'compact',
    maximumFractionDigits: 2,
  },
) {
  const fmt = Intl.NumberFormat('en-US', opt)
  return function formatScore(score: bigint | number) {
    return fmt.format(score)
  }
}

export function createPPFormatter(
  opt: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  },
) {
  const fmt = Intl.NumberFormat('en-US', opt)
  return function formatPP(score: bigint | number) {
    return fmt.format(score)
  }
}

export function createNumberFormatter() {
  const fmt = Intl.NumberFormat()
  return function addCommas(nStr: number | bigint) {
    return fmt.format(nStr)
  }
}

export function toDuration(duration: Date, startsFrom: Date = new Date(0)) {
  const sec_num = (duration.getTime() - startsFrom.getTime()) / 1000
  const hours = Math.floor(sec_num / 3600)
  const minutes = Math.floor((sec_num - hours * 3600) / 60)
  const seconds = sec_num - hours * 3600 - minutes * 60

  return {
    hours,
    minutes,
    seconds,
  }
}
