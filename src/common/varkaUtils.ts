import { BanchoPyMode } from '../adapters/bancho.py/backend-clients/enums'

export const modeToGulag = (mode = 'osu', mods = 'vn') => {
  switch (mode + '|' + mods) {
    case 'osu|vn': return BanchoPyMode.osuStandard
    case 'taiko|vn': return BanchoPyMode.taikoStandard
    case 'catch|vn': return BanchoPyMode.fruitsStandard
    case 'mania|vn': return BanchoPyMode.maniaStandard
    case 'osu|rx': return BanchoPyMode.osuRelax
    case 'taiko|rx': return BanchoPyMode.taikoRelax
    case 'catch|rx': return BanchoPyMode.fruitsRelax
    case 'osu|ap': return BanchoPyMode.osuAutopilot
    default: return -1
  }
}

export const getFlagURL = (flag: string) => {
  let url = 'https://osu.ppy.sh/assets/images/flags/'
  flag = flag.toUpperCase()
  for (let i = 0; i < flag.length; i++) {
    url += (flag.charCodeAt(i) + 127397).toString(16)
    url += i !== flag.length - 1 ? '-' : '.svg'
  }
  return url
}
export const
  scoreFormat = (score: bigint | number) => {
    return Intl.NumberFormat(undefined, { notation: 'compact' }).format(score)
  }

export const addCommas = (nStr: number | bigint) => {
  return Intl.NumberFormat().format(nStr)
}

export const forbiddenMode = (mods: string, mode: string) => {
  if (mods === 'rx' && mode === 'mania') {
    return true
  } else if (mods === 'ap' && mode !== 'osu') {
    return true
  } else {
    return false
  }
}

export const forbiddenMods = (mode: string, mods: string) => {
  if (mode === 'mania' && mods === 'rx') {
    return true
  } else if (mode !== 'osu' && mods === 'ap') {
    return true
  } else {
    return false
  }
}
