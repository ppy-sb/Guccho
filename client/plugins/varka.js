export default ({ app }, inject) => {
  inject('modeToGulag', (mode = 'osu', mods = 'vn') => {
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
  })
  inject('getFlagURL', (flag) => {
    let url = 'https://osu.ppy.sh/assets/images/flags/'
    flag = flag.toUpperCase()
    for (let i = 0; i < flag.length; i++) {
      url += (flag.charCodeAt(i) + 127397).toString(16)
      url += i !== flag.length - 1 ? '-' : '.svg'
    }
    return url
  })
  const scoreFormat = (score) => {
    if (score > 1000 * 1000) {
      if (score > 1000 * 1000 * 1000) { return `${addCommas((score / 1000000000).toFixed(2))} billion` }
      return `${addCommas((score / 1000000).toFixed(2))} million`
    }
    return addCommas(score)
  }
  const addCommas = (nStr) => {
    nStr += ''
    const x = nStr.split('.')
    let x1 = x[0]
    const x2 = x.length > 1 ? '.' + x[1] : ''
    const rgx = /(\d+)(\d{3})/
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2')
    }
    return x1 + x2
  }
  inject('scoreFormat', scoreFormat)
  inject('addCommas', addCommas)
}
