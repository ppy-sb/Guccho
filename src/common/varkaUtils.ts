import type { Mode, Ruleset } from '~/types/common'

export function getFlagURL(flag: string) {
  let url = 'https://osu.ppy.sh/assets/images/flags/'
  flag = flag.toUpperCase()
  for (let i = 0; i < flag.length; i++) {
    url += (flag.charCodeAt(i) + 127397).toString(16)
    url += i !== flag.length - 1 ? '-' : '.svg'
  }
  return url
}

export function createScoreFormatter(opt: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 2 }) {
  const fmt = Intl.NumberFormat(undefined, opt)
  return function scoreFormat(score: bigint | number) {
    return fmt.format(score)
  }
}

export function createPPFormatter(opt: Intl.NumberFormatOptions = { maximumFractionDigits: 2 }) {
  const fmt = Intl.NumberFormat(undefined, opt)
  return function scoreFormat(score: bigint | number) {
    return fmt.format(score)
  }
}

export function createAddCommasFormatter() {
  const fmt = Intl.NumberFormat()
  return function addCommas(nStr: number | bigint) {
    return fmt.format(nStr)
  }
}

export function forbiddenMode(mods: Ruleset, mode: Mode) {
  if (mods === 'relax' && mode === 'mania')
    return true
  else if (mods === 'autopilot' && mode !== 'osu')
    return true
  else return false
}

export function forbiddenMods(mode: Mode, mods: Ruleset) {
  if (mode === 'mania' && mods === 'relax')
    return true
  else if (mode !== 'osu' && mods === 'autopilot')
    return true
  else return false
}

export function toDuration(duration: Date, startsFrom: Date = new Date(0)) {
  const sec_num = (duration.getTime() - startsFrom.getTime()) / 1000
  const hours = Math.floor(sec_num / 3600)
  const minutes = Math.floor((sec_num - (hours * 3600)) / 60)
  const seconds = sec_num - (hours * 3600) - (minutes * 60)

  return {
    hours,
    minutes,
    seconds,
  }
}
