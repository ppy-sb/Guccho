export function getFlagURL(flag: string) {
  let url = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/'
  flag = flag.toUpperCase()
  for (let i = 0; i < flag.length; i++) {
    url += (flag.charCodeAt(i) + 127397).toString(16)
    url += i !== flag.length - 1 ? '-' : '.svg'
  }
  return url
}
