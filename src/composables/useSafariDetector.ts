export default function useSafari (def = false) {
  if (!process.client) { return def }
  const isSafari = navigator.userAgent.includes('Safari') && navigator.userAgent.indexOf('Chrome') <= -1
  return isSafari
}
