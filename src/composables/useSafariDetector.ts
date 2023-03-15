const detectClient = () => navigator.userAgent.search('Safari') >= 0 && navigator.userAgent.search('Chrome') < 0
const detectServer = () => useRequestHeaders(['user-agent'])['user-agent']?.includes('Safari')

export default (def = false) =>
  (process.server
    ? detectServer()
    : detectClient())
  || def
