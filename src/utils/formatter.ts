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

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
] as const

export function formatTimeAgo(date: Date, lang: string) {
  const relativeFormatter = new Intl.RelativeTimeFormat(lang, {
    numeric: 'auto',
  })
  let duration = (date.getTime() - Date.now()) / 1000

  for (const element of DIVISIONS) {
    const division = element
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }
}

/**
 * Formats a date as 'MMM d, yyyy, HH:mm' in the given locale.
 * Example: Jan 1, 2024, 13:45
 */
export function formatDate(date: Date | string | undefined | null, locale: string = 'en-US') {
  if (!date) {
    return ''
  }
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Date(date).toLocaleDateString(locale, options)
}
