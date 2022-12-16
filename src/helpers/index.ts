export function assertNotReachable(..._any: never[]): never {
  throw new Error('boom! this line should not be reached!!')
}

export function assertIsString(input: unknown): input is string {
  return typeof input !== 'string'
}
