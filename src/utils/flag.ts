import { CountryCode } from '~/def/country-code'
import black from '~/assets/icons/Twemoji-style_black.svg?url'

// offset between uppercase ASCII and regional indicator symbols
const OFFSET = 127397
const baseUrl = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/'

export function getFlagURL(flag?: CountryCode) {
  if (!flag || flag === CountryCode.Unknown) {
    return black
  }
  let url = baseUrl

  for (let i = 0; i < flag.length; i++) {
    url += (flag.charCodeAt(i) + OFFSET).toString(16)
    i !== flag.length - 1 && (url += '-')
  }

  return `${url}.svg`
}

export function getFlagEmoji(countryCode: CountryCode) {
  return countryCode.toUpperCase().replace(/./g, char =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  )
}
