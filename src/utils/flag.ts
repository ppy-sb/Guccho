import { CountryCode } from '~/def/country-code'
import black from '~/assets/Twemoji-style_black.svg?url'

const baseUrl = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/'
export function getFlagURL(flag?: CountryCode) {
  if (!flag || flag === CountryCode.Unknown) {
    return black
  }
  let url = baseUrl

  for (let i = 0; i < flag.length; i++) {
    url += (flag.charCodeAt(i) + 127397).toString(16)
    i !== flag.length - 1 && (url += '-')
  }

  return `${url}.svg`
}

// offset between uppercase ASCII and regional indicator symbols
const OFFSET = 127397
export function countryCodeToEmoji(code: CountryCode) {
  let emojiStr = ''
  // loop all characters
  for (let i = 0; i < code.length; i++) {
    emojiStr += (code.charAt(i) + OFFSET)
  }

  // return emoji
  return emojiStr
}
