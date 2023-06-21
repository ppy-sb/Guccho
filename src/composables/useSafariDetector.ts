function detectClient() {
  const UA = navigator.userAgent.toLowerCase()
  return UA.search('safari') >= 0 && UA.search('Chrome') < 0
}
function detectServer() {
  const UA = useRequestHeaders(['user-agent'])['user-agent']?.toLowerCase()
  return UA?.includes('safari')
}

export default (def = false) =>
  (process.server
    ? detectServer()
    : detectClient())
  || def
