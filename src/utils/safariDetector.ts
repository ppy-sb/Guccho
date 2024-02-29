function detectClient() {
  const UA = navigator.userAgent.toLowerCase()
  return UA.includes('safari') && !UA.includes('chrome')
}
function detectServer() {
  const UA = useRequestHeader('user-agent')?.toLowerCase() || ''
  return UA.includes('safari') && !UA.includes('chrome')
}

export function safariDetector() {
  // eslint-disable-next-line n/prefer-global/process
  return (process.server
    ? detectServer()
    : detectClient())
}
