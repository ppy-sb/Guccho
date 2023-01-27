export default function useSafari(def = false) {
  if (!process.client) {
    return def
  }
  const isSafari
    = navigator.userAgent.includes('Safari')
    && !navigator.userAgent.includes('Chrome')
  return isSafari
}
