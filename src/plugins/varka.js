export default defineNuxtPlugin(() => ({
  provide: {
    modeToGulag: (mode = 'osu', mods = 'vn') => {
      switch (mode + '|' + mods) {
        case 'osu|vn': return 0
        case 'taiko|vn': return 1
        case 'catch|vn': return 2
        case 'mania|vn': return 3
        case 'osu|rx': return 4
        case 'taiko|rx': return 5
        case 'catch|rx': return 6
        case 'osu|ap': return 7
        default: return -1
      }
    },
    getFlagURL: (flag) => {
      let url = 'https://osu.ppy.sh/assets/images/flags/'
      flag = flag.toUpperCase()
      for (let i = 0; i < flag.length; i++) {
        url += (flag.charCodeAt(i) + 127397).toString(16)
        url += i !== flag.length - 1 ? '-' : '.svg'
      }
      return url
    },
    scoreFormat: (score) => {
      return Intl.NumberFormat(undefined, { notation: 'compact' }).format(score)
      // if (score > 1000 * 1000) {
      //   if (score > 1000 * 1000 * 1000) { return `${addCommas((score / 1000000000).toFixed(2))} billion` }
      //   return `${addCommas((score / 1000000).toFixed(2))} million`
      // }
      // return addCommas(score)
    },
    addCommas: (nStr) => {
      return Intl.NumberFormat().format(nStr)
      // nStr += ''
      // const x = nStr.split('.')
      // let x1 = x[0]
      // const x2 = x.length > 1 ? '.' + x[1] : ''
      // const rgx = /(\d+)(\d{3})/
      // while (rgx.test(x1)) {
      //   x1 = x1.replace(rgx, '$1' + ',' + '$2')
      // }
      // return x1 + x2
    },
    forbiddenMode: (mods, mode) => {
      if (mods === 'rx' && mode === 'mania') {
        return true
      } else if (mods === 'ap' && mode !== 'osu') {
        return true
      } else {
        return false
      }
    },
    forbiddenMods: (mode, mods) => {
      if (mode === 'mania' && mods === 'rx') {
        return true
      } else if (mode !== 'osu' && mods === 'ap') {
        return true
      } else {
        return false
      }
    }
  }
}))
