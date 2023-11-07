/* eslint-disable n/prefer-global/process */
function ok(input?: unknown, message?: string) {
  if (!input) {
    throw new Error(message)
  }
}

export function env(key: string) {
  return (ok(process.env[key]), process.env[key] as NonNullable<typeof process.env[typeof key]>)
}
export function safeEnv(key: string) {
  return process.env[key]
}
