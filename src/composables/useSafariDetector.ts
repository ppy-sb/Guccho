const detectClient = () => navigator.userAgent.search('Safari') >= 0 && navigator.userAgent.search('Chrome') < 0
const detectServer = () => {
  const headers = useRequestHeaders(['user-agent'])
  return headers['user-agent']?.includes('Safari')
}

export default function useSafari(def = false) {
  return detectServer() || detectClient() || def
}
