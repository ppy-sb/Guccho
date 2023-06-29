const baseUrl = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/'
export function getFlagURL(flag: string) {
  flag = flag.toUpperCase()
  let url = baseUrl

  for (let i = 0; i < flag.length; i++) {
    url += (flag.charCodeAt(i) + 127397).toString(16)
    i !== flag.length - 1 && (url += '-')
  }

  return `${url}.svg`
}
